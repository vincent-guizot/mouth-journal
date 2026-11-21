import { after, before, beforeEach, describe, test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getBytes, listAll, ref, uploadBytes } from 'firebase/storage';
import { FIRESTORE_HOST, PROJECT_ID, STORAGE_HOST } from './helpers';
import { computeOverallRating } from '../../src/schemas/journalSchema';

/**
 * Security rules evaluated by the real Firestore/Storage emulators (not string
 * matching of the rules file).
 */
const root = path.resolve(__dirname, '../..');
let env: RulesTestEnvironment;

const ALICE = 'alice-uid';
const BOB = 'bob-uid';
const now = new Date().toISOString();

const journal = (uid: string, id: string, overrides: Record<string, unknown> = {}) => {
  const criteriaRating = { taste: 5, ambiance: 4, service: 3, price: 3 };
  return {
    id,
    userId: uid,
    placeId: 'osm-node-1',
    placeName: 'Kopi',
    placeAddress: '',
    mainCategory: 'drinks',
    subCategory: 'kopi',
    subCategoryLabel: 'Kopi/Cafe',
    latitude: -6.2,
    longitude: 106.8,
    photoUrls: [],
    overallRating: computeOverallRating(criteriaRating),
    criteriaRating,
    menuItems: [],
    totalSpent: 0,
    reviewText: '',
    tags: [],
    visitedAt: now,
    createdAt: now,
    ...overrides,
  };
};

const wish = (uid: string, placeId: string, overrides: Record<string, unknown> = {}) => ({
  id: placeId,
  userId: uid,
  placeId,
  placeName: 'Bakery',
  placeAddress: '',
  mainCategory: 'food',
  subCategory: 'bakery',
  subCategoryLabel: 'Bakery',
  latitude: -6.2,
  longitude: 106.8,
  createdAt: now,
  ...overrides,
});

const menuWish = (uid: string, id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  userId: uid,
  placeId: 'osm-way-7',
  placeName: 'Bakery',
  menuName: 'Croissant Almond',
  category: 'food',
  estimatedPrice: 35000,
  createdAt: now,
  ...overrides,
});

const settings = (overrides: Record<string, unknown> = {}) => ({
  appearance: 'light',
  searchRadiusKm: 5,
  foodPreferences: { favoriteCategories: [], preferredVenueTypes: [], recommendationPreferences: { enableAI: true, personalizedMenu: true } },
  ...overrides,
});

const alice = () => env.authenticatedContext(ALICE, { email: 'alice@example.test' });
const bob = () => env.authenticatedContext(BOB, { email: 'bob@example.test' });

before(async () => {
  const [fh, fp] = FIRESTORE_HOST.split(':');
  const [sh, sp] = STORAGE_HOST.split(':');
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: fh, port: Number(fp), rules: readFileSync(path.join(root, 'firebase/firestore.rules'), 'utf8') },
    storage: { host: sh, port: Number(sp), rules: readFileSync(path.join(root, 'firebase/storage.rules'), 'utf8') },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', ALICE), { uid: ALICE, email: 'alice@example.test', displayName: 'Alice', createdAt: now });
    await setDoc(doc(db, 'users', ALICE, 'journals', 'j1'), journal(ALICE, 'j1'));
    await setDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-node-9'), wish(ALICE, 'osm-node-9'));
    await setDoc(doc(db, 'users', ALICE, 'preferences', 'settings'), settings());
  });
});

describe('Firestore rules: cross-user isolation', () => {
  test('unauthenticated users cannot read anything', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', ALICE)));
    await assertFails(getDoc(doc(db, 'users', ALICE, 'journals', 'j1')));
  });

  test('owner can read own profile, journal, wishlist, preferences', async () => {
    const db = alice().firestore();
    await assertSucceeds(getDoc(doc(db, 'users', ALICE)));
    await assertSucceeds(getDoc(doc(db, 'users', ALICE, 'journals', 'j1')));
    await assertSucceeds(getDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-node-9')));
    await assertSucceeds(getDoc(doc(db, 'users', ALICE, 'preferences', 'settings')));
  });

  test('another user cannot read, write or delete Alice data', async () => {
    const db = bob().firestore();
    for (const p of [['users', ALICE], ['users', ALICE, 'journals', 'j1'], ['users', ALICE, 'wishlist', 'osm-node-9'], ['users', ALICE, 'preferences', 'settings']]) {
      const [a, ...rest] = p;
      await assertFails(getDoc(doc(db, a, ...rest)));
      await assertFails(deleteDoc(doc(db, a, ...rest)));
    }
    await assertFails(setDoc(doc(db, 'users', ALICE, 'journals', 'j2'), journal(ALICE, 'j2')));
    // Even writing Bob-owned content into Alice's tree is denied.
    await assertFails(setDoc(doc(db, 'users', ALICE, 'journals', 'j3'), journal(BOB, 'j3')));
    await assertFails(updateDoc(doc(db, 'users', ALICE, 'journals', 'j1'), { reviewText: 'hacked' }));
  });

  test('root and unknown collections are denied', async () => {
    const db = alice().firestore();
    await assertFails(setDoc(doc(db, 'journals', 'x'), journal(ALICE, 'x')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'secrets', 'x'), { a: 1 }));
  });
});

describe('Firestore rules: journal validation', () => {
  test('valid create succeeds', async () => {
    await assertSucceeds(setDoc(doc(alice().firestore(), 'users', ALICE, 'journals', 'j2'), journal(ALICE, 'j2')));
  });

  const invalid: [string, Record<string, unknown>][] = [
    ['rating 0', { criteriaRating: { taste: 0, ambiance: 4, service: 3, price: 3 }, overallRating: 2.5 }],
    ['rating 6', { criteriaRating: { taste: 6, ambiance: 4, service: 3, price: 3 }, overallRating: 4 }],
    ['fractional star', { criteriaRating: { taste: 4.5, ambiance: 4, service: 3, price: 3 }, overallRating: 3.6 }],
    ['overallRating inconsistent with criteria', { overallRating: 5 }],
    ['userId of someone else', { userId: BOB }],
    ['id different from doc id', { id: 'other' }],
    ['unknown extra key', { isPublic: true }],
    ['missing placeName', { placeName: '' }],
    ['bad mainCategory', { mainCategory: 'bar' }],
    ['non-https photo url', { photoUrls: ['file:///data/photo.jpg'] }],
    ['non-https second photo url', { photoUrls: ['https://example.com/1.jpg', 'http://insecure.com/2.jpg'] }],
    ['non-https third photo url', { photoUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'file:///data/3.jpg'] }],
    ['menuItem with negative price', { menuItems: [{ id: 'm1', name: 'Coffee', price: -1000 }] }],
    ['menuItem with empty name', { menuItems: [{ id: 'm1', name: '', price: 25000 }] }],
    ['menuItem with non-https photo', { menuItems: [{ id: 'm1', name: 'Coffee', price: 25000, photoUrl: 'http://insecure.com/pic.jpg' }] }],
    ['tag empty string', { tags: [''] }],
    ['tag too long', { tags: ['a'.repeat(41)] }],
    ['createdAt not ISO', { createdAt: 'yesterday' }],
    ['latitude out of range', { latitude: 123 }],
    ['latitude without longitude', { latitude: null, longitude: 106.8 }],
    ['negative totalSpent', { totalSpent: -1 }],
    ['updatedAt on create', { updatedAt: now }],
  ];
  for (const [name, overrides] of invalid) {
    test(`create rejected: ${name}`, async () => {
      await assertFails(setDoc(doc(alice().firestore(), 'users', ALICE, 'journals', 'j9'), journal(ALICE, 'j9', overrides)));
    });
  }

  test('client computeOverallRating and rules agree for every criteria sum 4..20', async () => {
    const db = alice().firestore();
    for (let sum = 4; sum <= 20; sum++) {
      // Spread the sum over four 1..5 stars.
      const stars = [1, 1, 1, 1];
      let rest = sum - 4;
      for (let i = 0; i < 4 && rest > 0; i++) {
        const add = Math.min(4, rest);
        stars[i] += add;
        rest -= add;
      }
      const criteriaRating = { taste: stars[0], ambiance: stars[1], service: stars[2], price: stars[3] };
      const id = `sum-${sum}`;
      await assertSucceeds(
        setDoc(doc(db, 'users', ALICE, 'journals', id), journal(ALICE, id, { criteriaRating, overallRating: computeOverallRating(criteriaRating) }))
      );
    }
  });

  test('manual place with null coordinates is allowed', async () => {
    await assertSucceeds(
      setDoc(doc(alice().firestore(), 'users', ALICE, 'journals', 'j4'), journal(ALICE, 'j4', { latitude: null, longitude: null, placeId: 'manual-abc' }))
    );
  });

  test('update keeps createdAt/userId immutable and requires updatedAt', async () => {
    const db = alice().firestore();
    const ref1 = doc(db, 'users', ALICE, 'journals', 'j1');
    await assertSucceeds(setDoc(ref1, journal(ALICE, 'j1', { reviewText: 'ok', updatedAt: now })));
    await assertFails(setDoc(ref1, journal(ALICE, 'j1', { reviewText: 'x' }))); // changed content without updatedAt
    // Idempotent re-delivery of a create (no updatedAt, identical content) is allowed.
    const ref5 = doc(db, 'users', ALICE, 'journals', 'j5');
    await assertSucceeds(setDoc(ref5, journal(ALICE, 'j5')));
    await assertSucceeds(setDoc(ref5, journal(ALICE, 'j5')));
    await assertFails(setDoc(ref5, journal(ALICE, 'j5', { reviewText: 'sneaky edit' })));
    await assertFails(setDoc(ref1, journal(ALICE, 'j1', { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now })));
  });

  test('owner can delete own journal', async () => {
    await assertSucceeds(deleteDoc(doc(alice().firestore(), 'users', ALICE, 'journals', 'j1')));
  });
});

describe('Firestore rules: wishlist, preferences, profile', () => {
  test('wishlist doc id must equal placeId and userId must be owner', async () => {
    const db = alice().firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-way-7'), wish(ALICE, 'osm-way-7')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'wishlist', 'random-id'), wish(ALICE, 'osm-way-7')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-way-8'), wish(BOB, 'osm-way-8')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-way-8'), wish(ALICE, 'osm-way-8', { latitude: 'x' })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'wishlist', 'osm-way-8'), wish(ALICE, 'osm-way-8', { ratingAverage: 4.5 })));
  });

  test('preferences: only settings doc, bounded radius, known appearance', async () => {
    const db = alice().firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE, 'preferences', 'settings'), settings({ searchRadiusKm: 10 })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'preferences', 'other'), settings()));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'preferences', 'settings'), settings({ searchRadiusKm: 0 })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'preferences', 'settings'), settings({ searchRadiusKm: 50 })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'preferences', 'settings'), settings({ appearance: 'neon' })));
  });

  test('profile: uid and email must match the auth token', async () => {
    const db = alice().firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE), { uid: ALICE, email: 'alice@example.test', displayName: 'Alice B', createdAt: now }));
    await assertFails(setDoc(doc(db, 'users', ALICE), { uid: BOB, email: 'alice@example.test', displayName: 'A', createdAt: now }));
    await assertFails(setDoc(doc(db, 'users', ALICE), { uid: ALICE, email: 'evil@example.test', displayName: 'A', createdAt: now }));
    await assertFails(setDoc(doc(db, 'users', ALICE), { uid: ALICE, email: 'alice@example.test', displayName: 'A', photoURL: 'http://x.test/a.jpg', createdAt: now }));
    await assertFails(setDoc(doc(db, 'users', ALICE), { uid: ALICE, email: 'alice@example.test', displayName: 'A', isAdmin: true, createdAt: now }));
  });

  test('profile createdAt is immutable', async () => {
    await assertFails(
      setDoc(doc(alice().firestore(), 'users', ALICE), { uid: ALICE, email: 'alice@example.test', displayName: 'A', createdAt: '2020-01-01T00:00:00.000Z' })
    );
  });

  test('menuWishlist: valid item succeeds, invalid price/empty name or foreign user fails', async () => {
    const db = alice().firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-1'), menuWish(ALICE, 'mw-1')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-2'), menuWish(BOB, 'mw-2')));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-3'), menuWish(ALICE, 'mw-3', { estimatedPrice: -500 })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-4'), menuWish(ALICE, 'mw-4', { menuName: '' })));
    await assertFails(setDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-5'), menuWish(ALICE, 'mw-5', { category: 'invalid-cat' })));
    await assertSucceeds(deleteDoc(doc(db, 'users', ALICE, 'menuWishlist', 'mw-1')));
  });
});

describe('Storage rules', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

  test('owner can upload a valid image to a known folder and read it back', async () => {
    const st = alice().storage();
    await assertSucceeds(uploadBytes(ref(st, `users/${ALICE}/journals/a.png`), png, { contentType: 'image/png' }));
    await assertSucceeds(getBytes(ref(st, `users/${ALICE}/journals/a.png`)));
    await assertSucceeds(listAll(ref(st, `users/${ALICE}`)));
  });

  test('non-image MIME is rejected', async () => {
    const st = alice().storage();
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/journals/a.txt`), png, { contentType: 'text/plain' }));
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/journals/a.svg`), png, { contentType: 'image/svg+xml' }));
  });

  test('files above 10 MB are rejected, exactly 10 MB is accepted', async () => {
    const st = alice().storage();
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/journals/big.jpg`), new Uint8Array(10 * 1024 * 1024 + 1), { contentType: 'image/jpeg' }));
    await assertSucceeds(uploadBytes(ref(st, `users/${ALICE}/journals/max.jpg`), new Uint8Array(10 * 1024 * 1024), { contentType: 'image/jpeg' }));
  });

  test('unknown folder and nested paths are rejected', async () => {
    const st = alice().storage();
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/other/a.png`), png, { contentType: 'image/png' }));
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/journals/x/y.png`), png, { contentType: 'image/png' }));
  });

  test('cross-user read, write, list and delete are rejected', async () => {
    await assertSucceeds(uploadBytes(ref(alice().storage(), `users/${ALICE}/avatars/me.png`), png, { contentType: 'image/png' }));
    const st = bob().storage();
    await assertFails(getBytes(ref(st, `users/${ALICE}/avatars/me.png`)));
    await assertFails(listAll(ref(st, `users/${ALICE}`)));
    await assertFails(uploadBytes(ref(st, `users/${ALICE}/avatars/evil.png`), png, { contentType: 'image/png' }));
    await assertFails(deleteObject(ref(st, `users/${ALICE}/avatars/me.png`)));
    await assertFails(getBytes(ref(env.unauthenticatedContext().storage(), `users/${ALICE}/avatars/me.png`)));
  });

  test('owner can delete own file', async () => {
    const st = alice().storage();
    await uploadBytes(ref(st, `users/${ALICE}/menus/m.png`), png, { contentType: 'image/png' });
    await assertSucceeds(deleteObject(ref(st, `users/${ALICE}/menus/m.png`)));
  });
});
