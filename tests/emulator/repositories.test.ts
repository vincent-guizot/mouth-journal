import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { disableNetwork, doc, enableNetwork, getDocFromServer } from 'firebase/firestore';
import { createRepositoryBundle } from '../../src/repositories/createRepositories';
import { JournalNotFoundError } from '../../src/repositories/journals/FirestoreJournalRepository';
import { ProfileNotFoundError } from '../../src/repositories/user-profile/FirestoreUserProfileRepository';
import { createMemoryKeyValueStore } from '../../src/storage/keyValueStore';
import { ClientHandle, createClient, placeInput, signUp, validJournalDraft } from './helpers';

/**
 * The production repository classes against the Firestore emulator, signed in as a
 * real Auth-emulator user so security rules are enforced on every request.
 */
let client: ClientHandle;
let uid: string;
let email: string;

const bundle = (kv = createMemoryKeyValueStore()) =>
  ({ kv, ...createRepositoryBundle({ mode: 'firebase', db: client.db, kv, remoteTimeoutMs: 3000 }) });

before(async () => {
  client = createClient();
  ({ uid, email } = await signUp(client, 'repo'));
  // Warm up the gRPC channel so the first timed write is not measured cold.
  await getDocFromServer(doc(client.db, 'users', uid)).catch(() => undefined);
});

/** Like the app: every load re-flushes the queue until the reconnect settles. */
const syncUntilEmpty = async (sync: () => Promise<{ pending: number; failed: unknown[] }>) => {
  let state = await sync();
  for (let i = 0; i < 5 && state.pending > 0; i++) {
    await new Promise((r) => setTimeout(r, 500));
    state = await sync();
  }
  return state;
};

after(async () => {
  await client.dispose();
});

const serverDoc = (...path: string[]) => {
  const [a, ...rest] = path;
  return getDocFromServer(doc(client.db, a, ...rest));
};

describe('Journal repository (online)', () => {
  test('create → read → update → delete round-trips through Firestore', async () => {
    const { journalRepository } = bundle();
    const created = await journalRepository.createJournal(uid, validJournalDraft());
    assert.equal(created.sync, 'synced');
    assert.equal(created.data.userId, uid);
    assert.equal(created.data.overallRating, 3.8);
    assert.ok((await serverDoc('users', uid, 'journals', created.data.id)).exists());

    const list = await journalRepository.getJournals(uid);
    assert.ok(list.some((j) => j.id === created.data.id));

    const updated = await journalRepository.updateJournal(uid, created.data.id, {
      reviewText: 'Updated',
      criteriaRating: { taste: 5, ambiance: 5, service: 5, price: 4 },
    });
    assert.equal(updated.sync, 'synced');
    assert.equal(updated.data.overallRating, 4.8, 'overallRating recomputed from criteria');
    assert.equal(updated.data.createdAt, created.data.createdAt, 'createdAt immutable');
    assert.ok(updated.data.updatedAt);
    const remote = await serverDoc('users', uid, 'journals', created.data.id);
    assert.equal(remote.data()?.reviewText, 'Updated');

    const deleted = await journalRepository.deleteJournal(uid, created.data.id);
    assert.equal(deleted.sync, 'synced');
    assert.equal((await serverDoc('users', uid, 'journals', created.data.id)).exists(), false);
    assert.equal(await journalRepository.getJournalById(uid, created.data.id), null);
  });

  test('caller cannot override id/userId/createdAt and overallRating is derived', async () => {
    const { journalRepository } = bundle();
    const { data } = await journalRepository.createJournal(uid, {
      ...validJournalDraft(),
      overallRating: 5,
      ...({ id: 'forced', userId: 'someone-else', createdAt: '2000-01-01T00:00:00.000Z' } as object),
    });
    assert.notEqual(data.id, 'forced');
    assert.equal(data.userId, uid);
    assert.notEqual(data.createdAt, '2000-01-01T00:00:00.000Z');
    assert.equal(data.overallRating, 3.8);
  });

  test('invalid payload (unrated criterion) is rejected before any write', async () => {
    const { journalRepository, kv } = bundle();
    await assert.rejects(
      journalRepository.createJournal(uid, validJournalDraft({ criteriaRating: { taste: 0, ambiance: 4, service: 3, price: 3 } }))
    );
    assert.deepEqual(kv.dump(), {});
  });

  test('updating a missing journal throws JournalNotFoundError', async () => {
    const { journalRepository } = bundle();
    await assert.rejects(journalRepository.updateJournal(uid, 'does-not-exist', { reviewText: 'x' }), JournalNotFoundError);
  });

  test('permanent rejection (writing into another user tree) rolls back the optimistic cache and throws', async () => {
    const { journalRepository, kv } = bundle();
    await assert.rejects(journalRepository.createJournal('other-user-uid', validJournalDraft()), (err: { code?: string }) => err.code === 'permission-denied');
    const cached = await journalRepository.getSyncState('other-user-uid');
    assert.equal(cached.pending, 0);
    assert.equal(Object.keys(kv.dump()).filter((k) => k.includes('other-user-uid_journals') && kv.dump()[k] !== '[]').length, 0);
  });
});

describe('Journal repository (offline-first)', () => {
  test('create/update/delete while disconnected succeed locally as pending, then sync', async () => {
    const { journalRepository, kv } = bundle();
    const online = await journalRepository.createJournal(uid, validJournalDraft({ placeName: 'Online First' }));
    assert.equal(online.sync, 'synced');

    await disableNetwork(client.db);
    try {
      const created = await journalRepository.createJournal(uid, validJournalDraft({ placeName: 'Offline Create' }));
      assert.equal(created.sync, 'pending');
      const updated = await journalRepository.updateJournal(uid, online.data.id, { reviewText: 'edited offline' });
      assert.equal(updated.sync, 'pending');
      const toDelete = await journalRepository.createJournal(uid, validJournalDraft({ placeName: 'Delete Me' }));
      const del = await journalRepository.deleteJournal(uid, toDelete.data.id);
      assert.equal(del.sync, 'pending');

      // Cache restored in the same session by a NEW repository instance sharing storage.
      const fresh = createRepositoryBundle({ mode: 'firebase', db: client.db, kv, remoteTimeoutMs: 3000 }).journalRepository;
      const offlineList = await fresh.getJournals(uid);
      const names = offlineList.map((j) => j.placeName);
      assert.ok(names.includes('Offline Create'));
      assert.ok(names.includes('Online First'));
      assert.ok(!names.includes('Delete Me'));
      assert.equal(offlineList.find((j) => j.id === online.data.id)?.reviewText, 'edited offline');
      assert.ok((await fresh.getSyncState(uid)).pending >= 3);
    } finally {
      await enableNetwork(client.db);
    }

    const state = await syncUntilEmpty(() => journalRepository.syncPending(uid));
    assert.equal(state.pending, 0);
    assert.equal(state.failed.length, 0);
    const list = await journalRepository.getJournals(uid);
    const created = list.find((j) => j.placeName === 'Offline Create');
    assert.ok(created);
    assert.ok((await serverDoc('users', uid, 'journals', created!.id)).exists());
    assert.equal((await serverDoc('users', uid, 'journals', online.data.id)).data()?.reviewText, 'edited offline');
    assert.ok(!list.some((j) => j.placeName === 'Delete Me'));
  });

  test('offline journal with pendingPhotoUris is stored locally, never sent to Firestore with local URI, and syncs cloud URLs when online', async () => {
    const { journalRepository } = bundle();
    await disableNetwork(client.db);
    let createdJournalId = '';
    try {
      const offline = await journalRepository.createJournal(
        uid,
        validJournalDraft({
          placeName: 'Offline With Photo',
          photoUrls: [],
          pendingPhotoUris: ['file:///cache/food.jpg'],
        })
      );
      assert.equal(offline.sync, 'pending');
      createdJournalId = offline.data.id;
      assert.deepEqual(offline.data.pendingPhotoUris, ['file:///cache/food.jpg']);

      const photoTasks = await journalRepository.photoQueue.getQueue(uid);
      assert.equal(photoTasks.length, 1);
      assert.equal(photoTasks[0].journalId, createdJournalId);
    } finally {
      await enableNetwork(client.db);
    }

    const fakeCloudUrl = 'https://firebasestorage.googleapis.com/v0/b/demo/o/uploaded.jpg?alt=media';
    await journalRepository.syncPending(uid, async () => ({ url: fakeCloudUrl }));

    const updated = await journalRepository.getJournalById(uid, createdJournalId);
    assert.ok(updated);
    assert.deepEqual(updated.photoUrls, [fakeCloudUrl]);
    assert.equal(updated.pendingPhotoUris, undefined);

    const tasksAfter = await journalRepository.photoQueue.getQueue(uid);
    assert.equal(tasksAfter.length, 0);

    const docSnap = await serverDoc('users', uid, 'journals', createdJournalId);
    assert.ok(docSnap.exists());
    assert.deepEqual(docSnap.data()?.photoUrls, [fakeCloudUrl]);
    assert.equal(docSnap.data()?.pendingPhotoUris, undefined);
  });

  test('cache never leaks between users sharing one device storage', async () => {
    const kv = createMemoryKeyValueStore();
    const repoA = createRepositoryBundle({ mode: 'firebase', db: client.db, kv, remoteTimeoutMs: 3000 }).journalRepository;
    const { data } = await repoA.createJournal(uid, validJournalDraft({ placeName: 'Only A' }));
    // Tamper: copy A's cache into B's key. B must still not see A's journal.
    const keyA = `@mouthjournal_cache_${uid}_journals`;
    await kv.setItem('@mouthjournal_cache_user-b_journals', (await kv.getItem(keyA))!);
    await disableNetwork(client.db);
    try {
      const bundleB = createRepositoryBundle({ mode: 'firebase', db: client.db, kv, remoteTimeoutMs: 3000 });
      const bList = await bundleB.journalRepository.getJournals('user-b');
      assert.equal(bList.length, 0, 'foreign-owned cache entries are rejected');
      assert.equal(await bundleB.journalRepository.getJournalById('user-b', data.id), null);
    } finally {
      await enableNetwork(client.db);
    }
  });
});

describe('Wishlist repository', () => {
  test('add is keyed by real placeId, deduplicated, queryable and removable', async () => {
    const { wishlistRepository } = bundle();
    const first = await wishlistRepository.addToWishlist(uid, placeInput('osm-way-42'));
    assert.equal(first.data.id, 'osm-way-42');
    assert.equal(first.data.placeId, 'osm-way-42');
    const again = await wishlistRepository.addToWishlist(uid, placeInput('osm-way-42'));
    assert.equal(again.data.createdAt, first.data.createdAt);
    assert.equal((await wishlistRepository.getWishlist(uid)).filter((w) => w.placeId === 'osm-way-42').length, 1);
    assert.equal(await wishlistRepository.isInWishlist(uid, 'osm-way-42'), true);
    assert.equal((await serverDoc('users', uid, 'wishlist', 'osm-way-42')).data()?.placeName, 'Bakery Test');

    await wishlistRepository.removeFromWishlist(uid, 'osm-way-42');
    assert.equal(await wishlistRepository.isInWishlist(uid, 'osm-way-42'), false);
    assert.equal((await serverDoc('users', uid, 'wishlist', 'osm-way-42')).exists(), false);
  });

  test('rejects input without coordinates or with a name as id', async () => {
    const { wishlistRepository } = bundle();
    await assert.rejects(wishlistRepository.addToWishlist(uid, { ...placeInput(), latitude: undefined as unknown as number }));
    await assert.rejects(wishlistRepository.addToWishlist(uid, { ...placeInput(), placeId: 'Bakery Test With Spaces' }));
  });

  test('offline add is pending and synced later', async () => {
    const { wishlistRepository } = bundle();
    await disableNetwork(client.db);
    let sync: string;
    try {
      ({ sync } = await wishlistRepository.addToWishlist(uid, placeInput('osm-node-777')));
      assert.equal(await wishlistRepository.isInWishlist(uid, 'osm-node-777'), true);
    } finally {
      await enableNetwork(client.db);
    }
    assert.equal(sync, 'pending');
    assert.equal((await syncUntilEmpty(() => wishlistRepository.syncPending(uid))).pending, 0);
    assert.ok((await serverDoc('users', uid, 'wishlist', 'osm-node-777')).exists());
  });
});

describe('Menu Wishlist repository', () => {
  test('addMenuWishlist round-trips to Firestore, is queryable, and removable', async () => {
    const { menuWishlistRepository } = bundle();
    const created = await menuWishlistRepository.addMenuWishlist(uid, {
      placeId: 'osm-way-99',
      placeName: 'Kopi & Roti',
      menuName: 'Espresso Romano',
      category: 'drink',
      estimatedPrice: 32000,
      notes: 'Harus coba varian lemon zest',
    });
    assert.equal(created.sync, 'synced');
    assert.ok(created.data.id.startsWith('mw-'));
    assert.equal(created.data.userId, uid);
    assert.equal(created.data.menuName, 'Espresso Romano');
    assert.ok((await serverDoc('users', uid, 'menuWishlist', created.data.id)).exists());

    const list = await menuWishlistRepository.getMenuWishlist(uid);
    assert.ok(list.some((m) => m.id === created.data.id));

    const removed = await menuWishlistRepository.removeMenuWishlist(uid, created.data.id);
    assert.equal(removed.sync, 'synced');
    assert.equal((await serverDoc('users', uid, 'menuWishlist', created.data.id)).exists(), false);
  });

  test('offline add is pending and synced later', async () => {
    const { menuWishlistRepository } = bundle();
    await disableNetwork(client.db);
    let sync: string;
    let createdId: string;
    try {
      const res = await menuWishlistRepository.addMenuWishlist(uid, {
        placeId: 'osm-way-100',
        placeName: 'Kedai Mie',
        menuName: 'Mie Ayam Jamur',
        estimatedPrice: 28000,
      });
      sync = res.sync;
      createdId = res.data.id;
      const list = await menuWishlistRepository.getMenuWishlist(uid);
      assert.ok(list.some((m) => m.id === createdId));
    } finally {
      await enableNetwork(client.db);
    }
    assert.equal(sync, 'pending');
    assert.equal((await syncUntilEmpty(() => menuWishlistRepository.syncPending(uid))).pending, 0);
    assert.ok((await serverDoc('users', uid, 'menuWishlist', createdId)).exists());
  });
});

describe('Profile and preferences repositories', () => {
  test('profile save/get/update with Firestore rules (email = auth email)', async () => {
    const { userProfileRepository } = bundle();
    await assert.rejects(userProfileRepository.updateProfile(uid, { bio: 'x' }), ProfileNotFoundError);
    const saved = await userProfileRepository.saveProfile(uid, {
      uid,
      email,
      displayName: 'Repo User',
      culinaryPreferences: [],
      favoriteVenueTypes: [],
      favoriteLocations: [],
    });
    assert.equal(saved.sync, 'synced');
    const updated = await userProfileRepository.updateProfile(uid, { bio: 'Pecinta kopi', uid: 'hijack' });
    assert.equal(updated.data.uid, uid);
    assert.equal(updated.data.createdAt, saved.data.createdAt);
    assert.equal((await serverDoc('users', uid)).data()?.bio, 'Pecinta kopi');
    assert.equal((await userProfileRepository.getProfile(uid))?.bio, 'Pecinta kopi');
  });

  test('profile with a different email is rejected by rules and rolled back', async () => {
    const { userProfileRepository } = bundle();
    await assert.rejects(userProfileRepository.updateProfile(uid, { email: 'spoof@example.test' }));
    assert.equal((await userProfileRepository.getProfile(uid))?.email, email);
  });

  test('updatePreferences merges multi-field patches in one write without dropping fields', async () => {
    const { userPreferencesRepository } = bundle();
    await userPreferencesRepository.updatePreferences(uid, { favoriteCategories: ['Kopi'], preferredVenueTypes: ['Café'] });
    const { data } = await userPreferencesRepository.updatePreferences(uid, { appearance: 'light', searchRadiusKm: 10, favoriteCategories: ['Kopi', 'Bakery'] });
    assert.equal(data.searchRadiusKm, 10);
    assert.deepEqual(data.foodPreferences.favoriteCategories, ['Kopi', 'Bakery']);
    assert.deepEqual(data.foodPreferences.preferredVenueTypes, ['Café'], 'unrelated field preserved');
    const remote = (await serverDoc('users', uid, 'preferences', 'settings')).data();
    assert.equal(remote?.searchRadiusKm, 10);
    assert.deepEqual(remote?.foodPreferences.preferredVenueTypes, ['Café']);
    const reread = await bundle().userPreferencesRepository.getSettings(uid);
    assert.deepEqual(reread.foodPreferences.favoriteCategories, ['Kopi', 'Bakery']);
  });

  test('invalid preference patch is rejected', async () => {
    const { userPreferencesRepository } = bundle();
    await assert.rejects(userPreferencesRepository.updatePreferences(uid, { searchRadiusKm: 99 }));
    await assert.rejects(userPreferencesRepository.updatePreferences(uid, { themeMode: 'dark' } as never));
  });
});
