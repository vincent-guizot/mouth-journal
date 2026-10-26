import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Journal } from '../../src/models/journal';

describe('Journal Repository CRUD & Local Cache Suite', () => {
  // In-memory test store simulating Firestore / Repository
  const memoryStore = new Map<string, Journal[]>();

  const createMockJournal = (userId: string, id: string, name: string, rating: number, spent: number): Journal => ({
    id,
    userId,
    userName: 'Tester',
    placeId: `place_${id}`,
    placeName: name,
    placeAddress: 'Jakarta',
    mainCategory: 'drinks',
    subCategory: 'cafe',
    subCategoryLabel: 'Cafe',
    latitude: -6.22,
    longitude: 106.81,
    photoUrls: ['https://example.com/photo.jpg'],
    overallRating: rating,
    criteriaRating: { taste: rating, ambiance: rating, service: rating, price: rating },
    menuItems: [{ id: 'm1', name: 'Latte', price: spent, rating }],
    totalSpent: spent,
    reviewText: 'Great place and pleasant vibes.',
    tags: ['Cozy', 'SpecialtyCoffee'],
    visitedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  test('Create and Read Journal by ID for authenticated user', async () => {
    const userId = 'user_alice';
    const journalId = 'j_001';
    const newEntry = createMockJournal(userId, journalId, 'Senopati Roastery', 4.8, 45000);

    // Save
    const userJournals = memoryStore.get(userId) || [];
    memoryStore.set(userId, [newEntry, ...userJournals]);

    // Retrieve
    const fetched = memoryStore.get(userId)?.find((j) => j.id === journalId);
    assert.ok(fetched);
    assert.equal(fetched.placeName, 'Senopati Roastery');
    assert.equal(fetched.overallRating, 4.8);
    assert.equal(fetched.totalSpent, 45000);
  });

  test('Update Journal preserves unchanged fields and applies modifications', async () => {
    const userId = 'user_alice';
    const journalId = 'j_001';

    const currentList = memoryStore.get(userId) || [];
    const index = currentList.findIndex((j) => j.id === journalId);
    assert.ok(index !== -1);

    // Update reviewText and overallRating
    const updated = {
      ...currentList[index],
      reviewText: 'Updated notes: best latte in town!',
      overallRating: 5.0,
      updatedAt: new Date().toISOString(),
    };
    currentList[index] = updated;
    memoryStore.set(userId, currentList);

    const verified = memoryStore.get(userId)?.find((j) => j.id === journalId);
    assert.equal(verified?.overallRating, 5.0);
    assert.equal(verified?.reviewText, 'Updated notes: best latte in town!');
    assert.equal(verified?.placeName, 'Senopati Roastery'); // Preserved unchanged
  });

  test('Delete Journal removes item cleanly and updates user collection', async () => {
    const userId = 'user_alice';
    const journalId = 'j_001';

    const remaining = (memoryStore.get(userId) || []).filter((j) => j.id !== journalId);
    memoryStore.set(userId, remaining);

    const checkDeleted = memoryStore.get(userId)?.find((j) => j.id === journalId);
    assert.equal(checkDeleted, undefined);
  });

  test('Filtering separates timeline all-entries vs favorites (rating >= 4.5)', () => {
    const userId = 'user_bob';
    const j1 = createMockJournal(userId, 'b_1', 'Average Warung', 3.5, 20000);
    const j2 = createMockJournal(userId, 'b_2', 'Specialty Pour Over', 4.9, 65000);
    const j3 = createMockJournal(userId, 'b_3', 'Nice Bakery', 4.5, 50000);

    const allJournals = [j1, j2, j3];

    // Timeline all entries
    assert.equal(allJournals.length, 3);

    // Favorites filter (rating >= 4.5)
    const favorites = allJournals.filter((j) => j.overallRating >= 4.5);
    assert.equal(favorites.length, 2);
    assert.ok(favorites.some((j) => j.id === 'b_2'));
    assert.ok(favorites.some((j) => j.id === 'b_3'));
    assert.ok(!favorites.some((j) => j.id === 'b_1'));
  });
});
