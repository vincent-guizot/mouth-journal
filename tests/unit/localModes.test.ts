import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRepositoryBundle } from '../../src/repositories/createRepositories';
import { BackendNotConfiguredError, isTransientRemoteError, stripUndefined, withTimeout, RemoteTimeoutError } from '../../src/repositories/sync/remote';
import { createMemoryKeyValueStore } from '../../src/storage/keyValueStore';
import { AuthError, AuthService } from '../../src/services/auth/AuthService';
import { DEMO_USER_ID, resolveAppMode } from '../../src/config/env';
import { uploadImage } from '../../src/services/images/imageUpload';
import { mergePreferencesPatch } from '../../src/repositories/user-preferences/FirestoreUserPreferencesRepository';
import { DEFAULT_APP_SETTINGS } from '../../src/models/preferences';

const draft = () => ({
  placeId: 'manual-1', placeName: 'Warung', placeAddress: '', mainCategory: 'food' as const, subCategory: 'restoran',
  subCategoryLabel: 'Restoran', latitude: null, longitude: null, photoUrls: ['file:///local/photo.jpg'], overallRating: 4,
  criteriaRating: { taste: 4, ambiance: 4, service: 4, price: 4 }, menuItems: [], totalSpent: 0, reviewText: '', tags: [],
  visitedAt: new Date(Date.now() - 1000).toISOString(),
});

describe('App mode resolution', () => {
  const full = { apiKey: 'AIzaSy-real-looking-key', projectId: 'p', appId: 'a', storageBucket: 'b' };
  test('demo only when explicitly enabled (never implied by __DEV__)', () => {
    assert.equal(resolveAppMode({ demoModeFlag: 'true', firebaseConfig: {} }), 'demo');
    assert.equal(resolveAppMode({ demoModeFlag: undefined, firebaseConfig: {} }), 'unconfigured');
    assert.equal(resolveAppMode({ demoModeFlag: 'false', firebaseConfig: full }), 'firebase');
  });
});

describe('Unconfigured mode fails loudly', () => {
  const kv = createMemoryKeyValueStore();
  const repos = createRepositoryBundle({ mode: 'unconfigured', db: null, kv });
  test('repositories throw BackendNotConfiguredError', async () => {
    await assert.rejects(repos.journalRepository.getJournals('u'), BackendNotConfiguredError);
    await assert.rejects(repos.wishlistRepository.addToWishlist('u', { placeId: 'osm-node-1', placeName: 'A', mainCategory: 'food', subCategory: 'x', subCategoryLabel: 'X', latitude: 0, longitude: 0 }), BackendNotConfiguredError);
  });
  test('auth throws instead of logging in a fake user', async () => {
    const auth = new AuthService({ mode: 'unconfigured', auth: null, db: null, storage: null, kv, repositories: repos });
    await assert.rejects(auth.login('a@b.co', 'x'), BackendNotConfiguredError);
    await assert.rejects(auth.sendPasswordReset('a@b.co'), BackendNotConfiguredError);
    await assert.rejects(auth.deleteAccount('x'), BackendNotConfiguredError);
  });
  test('image upload throws instead of returning a local URI as a cloud URL', async () => {
    await assert.rejects(uploadImage({ mode: 'unconfigured', storage: null }, { uri: 'file:///a.jpg', userId: 'u', folder: 'journals' }), BackendNotConfiguredError);
  });
});

describe('Explicit demo mode (local only)', () => {
  test('one stable UID across logins and registers; logout keeps the only local copy', async () => {
    const kv = createMemoryKeyValueStore();
    const repos = createRepositoryBundle({ mode: 'demo', db: null, kv });
    const auth = new AuthService({ mode: 'demo', auth: null, db: null, storage: null, kv, repositories: repos });
    const s1 = await auth.login('demo@example.test', 'anything');
    const s2 = await auth.register('other@example.test', 'Passw0rd1', 'Demo');
    assert.equal(s1.uid, DEMO_USER_ID);
    assert.equal(s2.uid, DEMO_USER_ID);
    const { data, sync } = await repos.journalRepository.createJournal(DEMO_USER_ID, draft());
    assert.equal(sync, 'local', 'demo writes are labelled local, never "synced"');
    assert.deepEqual(data.photoUrls, ['file:///local/photo.jpg'], 'local URI allowed only in demo');
    await auth.logout();
    assert.equal(await auth.getCurrentSession(), null);
    assert.equal((await repos.journalRepository.getJournals(DEMO_USER_ID)).length, 1);
  });

  test('password reset and social sign-in are honestly unavailable', async () => {
    const kv = createMemoryKeyValueStore();
    const auth = new AuthService({ mode: 'demo', auth: null, db: null, storage: null, kv, repositories: createRepositoryBundle({ mode: 'demo', db: null, kv }) });
    await assert.rejects(auth.sendPasswordReset('a@b.co'), (e: AuthError) => e.code === 'app/unsupported-in-demo');
    assert.deepEqual(auth.socialSignInAvailable, { google: false, apple: false });
  });

  test('demo account deletion wipes all local keys of the demo user', async () => {
    const kv = createMemoryKeyValueStore();
    const repos = createRepositoryBundle({ mode: 'demo', db: null, kv });
    const auth = new AuthService({ mode: 'demo', auth: null, db: null, storage: null, kv, repositories: repos });
    await auth.login('demo@example.test', 'x');
    await repos.journalRepository.createJournal(DEMO_USER_ID, draft());
    await auth.deleteAccount('');
    assert.deepEqual(Object.keys(kv.dump()), []);
  });

  test('cloud schema still applies in Firebase mode: local photo URIs rejected', async () => {
    const kv = createMemoryKeyValueStore();
    // db is never reached: validation happens first.
    const repos = createRepositoryBundle({ mode: 'firebase', db: {} as never, kv });
    await assert.rejects(repos.journalRepository.createJournal('u', draft()));
    assert.deepEqual(kv.dump(), {});
  });
});

describe('Cache validation', () => {
  test('corrupt JSON cache is discarded, not returned', async () => {
    const kv = createMemoryKeyValueStore();
    const repos = createRepositoryBundle({ mode: 'demo', db: null, kv });
    await kv.setItem(`@mouthjournal_cache_${DEMO_USER_ID}_journals`, '{not json');
    assert.deepEqual(await repos.journalRepository.getJournals(DEMO_USER_ID), []);
    assert.equal(await kv.getItem(`@mouthjournal_cache_${DEMO_USER_ID}_journals`), null);
  });

  test('schema-invalid and foreign-owner entries are dropped from cache', async () => {
    const kv = createMemoryKeyValueStore();
    const repos = createRepositoryBundle({ mode: 'demo', db: null, kv });
    const { data } = await repos.journalRepository.createJournal(DEMO_USER_ID, draft());
    const key = `@mouthjournal_cache_${DEMO_USER_ID}_journals`;
    const entries = JSON.parse((await kv.getItem(key))!);
    entries.push({ ...data, id: 'foreign', userId: 'someone-else' });
    entries.push({ ...data, id: 'bad', overallRating: 9 });
    await kv.setItem(key, JSON.stringify(entries));
    const list = await repos.journalRepository.getJournals(DEMO_USER_ID);
    assert.deepEqual(list.map((j) => j.id), [data.id]);
  });

  test('wishlist cache entries with legacy fake ids (placeId = name) are rejected', async () => {
    const kv = createMemoryKeyValueStore();
    const repos = createRepositoryBundle({ mode: 'demo', db: null, kv });
    await kv.setItem(
      `@mouthjournal_cache_${DEMO_USER_ID}_wishlist`,
      JSON.stringify([{ id: 'wish_1', userId: DEMO_USER_ID, placeId: 'Kopi Kenangan', placeName: 'Kopi Kenangan', mainCategory: 'drinks', subCategory: 'cafe', latitude: -6.229746, longitude: 106.816431, createdAt: new Date().toISOString() }])
    );
    assert.deepEqual(await repos.wishlistRepository.getWishlist(DEMO_USER_ID), []);
  });
});

describe('Preferences merge', () => {
  test('multi-field patch keeps every field and unrelated food preferences', () => {
    const start = { ...DEFAULT_APP_SETTINGS, foodPreferences: { ...DEFAULT_APP_SETTINGS.foodPreferences, preferredVenueTypes: ['Café'] } };
    const merged = mergePreferencesPatch(start, { appearance: 'dark', searchRadiusKm: 10, favoriteCategories: ['Kopi'] });
    assert.equal(merged.appearance, 'dark');
    assert.equal(merged.searchRadiusKm, 10);
    assert.deepEqual(merged.foodPreferences.favoriteCategories, ['Kopi']);
    assert.deepEqual(merged.foodPreferences.preferredVenueTypes, ['Café']);
    const venue = mergePreferencesPatch(merged, { preferredVenueTypes: ['Bakery'] });
    assert.deepEqual(venue.foodPreferences.favoriteCategories, ['Kopi']);
    assert.equal(venue.searchRadiusKm, 10);
  });
  test('rejects unknown keys and out-of-range values', () => {
    assert.throws(() => mergePreferencesPatch(DEFAULT_APP_SETTINGS, { themeMode: 'dark' } as never));
    assert.throws(() => mergePreferencesPatch(DEFAULT_APP_SETTINGS, { searchRadiusKm: 0 }));
  });
});

describe('Remote helpers', () => {
  test('withTimeout rejects with a transient RemoteTimeoutError', async () => {
    await assert.rejects(withTimeout(new Promise(() => undefined), 20, 'x'), RemoteTimeoutError);
    assert.equal(isTransientRemoteError(new RemoteTimeoutError('x', 1)), true);
    assert.equal(isTransientRemoteError({ code: 'unavailable' }), true);
    assert.equal(isTransientRemoteError({ code: 'permission-denied' }), false);
  });
  test('stripUndefined removes undefined recursively but keeps null', () => {
    assert.deepEqual(stripUndefined({ a: undefined, b: null, c: [{ d: undefined, e: 1 }] }), { b: null, c: [{ e: 1 }] });
  });
});
