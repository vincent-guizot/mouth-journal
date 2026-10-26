import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MockJournalRepository,
  MockWishlistRepository,
  MockUserPreferencesRepository,
  MockUserProfileRepository,
} from '../../src/mocks/repositories';

describe('Mock Repositories Layer & Offline Cache Suite', () => {
  const testUserId = 'test_mock_user_123';

  test('MockJournalRepository supports get, create, update, delete', async () => {
    const repo = new MockJournalRepository();

    // 1. Get initial journals
    const initial = await repo.getJournals(testUserId);
    assert.ok(Array.isArray(initial));
    assert.ok(initial.length > 0);

    // 2. Create new journal
    const created = await repo.createJournal(testUserId, {
      userId: testUserId,
      placeId: 'place_99',
      placeName: 'Kopi Baru Test',
      placeAddress: 'Jl. Test No. 99',
      mainCategory: 'drinks',
      subCategory: 'cafe',
      subCategoryLabel: 'Kopi/Cafe',
      latitude: -6.22,
      longitude: 106.81,
      photoUrls: ['https://example.com/test.jpg'],
      overallRating: 4.8,
      criteriaRating: { taste: 5, ambiance: 4.5, service: 4.5, price: 4.5 },
      menuItems: [{ id: 'm1', name: 'Latte', price: 35000, rating: 5 }],
      totalSpent: 35000,
      reviewText: 'Kopi sangat nikmat!',
      tags: ['Kopi', 'Test'],
      visitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    assert.ok(created.id);
    assert.equal(created.placeName, 'Kopi Baru Test');

    // 3. Read by ID
    const fetched = await repo.getJournalById(testUserId, created.id);
    assert.ok(fetched);
    assert.equal(fetched?.id, created.id);

    // 4. Update
    const updated = await repo.updateJournal(testUserId, created.id, {
      reviewText: 'Kopi sangat nikmat dan barista ramah!',
    });
    assert.equal(updated.reviewText, 'Kopi sangat nikmat dan barista ramah!');

    // 5. Delete
    await repo.deleteJournal(testUserId, created.id);
    const afterDelete = await repo.getJournalById(testUserId, created.id);
    assert.equal(afterDelete, null);
  });

  test('MockWishlistRepository supports get, add, isInWishlist, remove', async () => {
    const repo = new MockWishlistRepository();

    // 1. Get initial
    const initial = await repo.getWishlist(testUserId);
    assert.ok(Array.isArray(initial));

    // 2. Add
    const added = await repo.addToWishlist(testUserId, {
      placeId: 'place_wish_abc',
      placeName: 'Restoran Impian',
      placeAddress: 'Jakarta',
      mainCategory: 'food',
      subCategory: 'restaurant',
      latitude: -6.2,
      longitude: 106.8,
      personalNotes: 'Ingin coba pasta',
    });
    assert.ok(added.id);

    // 3. Check isInWishlist
    const inWish = await repo.isInWishlist(testUserId, 'place_wish_abc');
    assert.equal(inWish, true);

    // 4. Remove
    await repo.removeFromWishlist(testUserId, added.id);
    const inWishAfter = await repo.isInWishlist(testUserId, 'place_wish_abc');
    assert.equal(inWishAfter, false);
  });

  test('MockUserPreferencesRepository manages app settings and food preferences', async () => {
    const repo = new MockUserPreferencesRepository();

    const settings = await repo.getSettings(testUserId);
    assert.ok(settings);
    assert.equal(settings.distanceUnit, 'km');

    // Update
    const updated = await repo.updateSettings(testUserId, {
      searchRadiusKm: 15,
    });
    assert.equal(updated.searchRadiusKm, 15);
  });

  test('MockUserProfileRepository manages user profile', async () => {
    const repo = new MockUserProfileRepository();

    const profile = await repo.getProfile(testUserId);
    assert.ok(profile);
    assert.equal(profile?.uid, testUserId);

    const updated = await repo.updateProfile(testUserId, {
      bio: 'Bio kuliner baru',
    });
    assert.equal(updated.bio, 'Bio kuliner baru');
  });
});
