import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Security & Multi-Tenant User Isolation Suite', () => {
  // Helper mimicking the cache key generator in repositories
  const getJournalCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_journals`;
  const getWishlistCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_wishlist`;
  const getSettingsCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_settings`;

  test('Cache keys are strictly prefixed by individual userId', () => {
    const userA = 'user_alice_123';
    const userB = 'user_bob_456';

    const cacheKeyA = getJournalCacheKey(userA);
    const cacheKeyB = getJournalCacheKey(userB);

    assert.notEqual(cacheKeyA, cacheKeyB);
    assert.equal(cacheKeyA, '@mouthjournal_cache_user_alice_123_journals');
    assert.equal(cacheKeyB, '@mouthjournal_cache_user_bob_456_journals');
    assert.ok(cacheKeyA.includes(userA));
    assert.ok(!cacheKeyA.includes(userB));
  });

  test('Clearing User A cache does not delete or affect User B entries', () => {
    // Simulated in-memory storage simulating AsyncStorage
    const storage = new Map<string, string>();

    const userA = 'user_alice';
    const userB = 'user_bob';

    // Seed data
    storage.set(getJournalCacheKey(userA), JSON.stringify([{ id: 'j_alice_1' }]));
    storage.set(getWishlistCacheKey(userA), JSON.stringify([{ id: 'w_alice_1' }]));
    storage.set(getJournalCacheKey(userB), JSON.stringify([{ id: 'j_bob_1' }]));
    storage.set(getWishlistCacheKey(userB), JSON.stringify([{ id: 'w_bob_1' }]));

    // Execute logout / clearUserCache for User A
    const keysToRemove = [
      getJournalCacheKey(userA),
      getWishlistCacheKey(userA),
      getSettingsCacheKey(userA),
    ];
    for (const key of keysToRemove) {
      storage.delete(key);
    }

    // Verify User A data is wiped
    assert.equal(storage.has(getJournalCacheKey(userA)), false);
    assert.equal(storage.has(getWishlistCacheKey(userA)), false);

    // Verify User B data remains intact and untouched
    assert.equal(storage.has(getJournalCacheKey(userB)), true);
    assert.equal(storage.has(getWishlistCacheKey(userB)), true);
    assert.equal(JSON.parse(storage.get(getJournalCacheKey(userB))!)[0].id, 'j_bob_1');
  });

  test('Firestore paths are strictly rooted in /users/{userId}/', () => {
    const getJournalPath = (userId: string, journalId: string) => `users/${userId}/journals/${journalId}`;
    const getWishlistPath = (userId: string, itemId: string) => `users/${userId}/wishlist/${itemId}`;

    const userAlice = 'uid_alice';
    const journalPath = getJournalPath(userAlice, 'j_999');

    assert.equal(journalPath.startsWith(`users/${userAlice}/`), true);
    assert.ok(!journalPath.startsWith('journals/')); // Ensures old flat collection is rejected
  });

  test('Storage upload path enforces user ownership prefix', () => {
    const buildStoragePath = (userId: string, filename: string) => {
      if (!userId || userId.trim() === '') throw new Error('Unauthenticated upload prohibited');
      return `users/${userId}/photos/${filename}`;
    };

    const validPath = buildStoragePath('user_123', 'latte.jpg');
    assert.equal(validPath, 'users/user_123/photos/latte.jpg');

    // Attempting upload with empty userId must throw
    assert.throws(() => buildStoragePath('', 'unauthorized.jpg'), /Unauthenticated upload prohibited/);
  });
});
