import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAvailableMonths,
  formatMonthLabel,
  calculateMonthlyDigest,
} from '../../src/features/analytics/culinaryAnalytics';
import type { Journal } from '../../src/models/journal';

const mockJournal = (o: Partial<Journal>): Journal => {
  const ts = o.visitedAt || o.createdAt || '2026-11-10T12:00:00.000Z';
  return {
    id: 'j1',
    userId: 'u1',
    placeId: 'osm-node-101',
    placeName: 'Warung Bu Siti',
    placeAddress: 'Jl. Merdeka No. 1',
    mainCategory: 'food',
    subCategory: 'warung',
    subCategoryLabel: 'Warung Makan',
    latitude: -6.2,
    longitude: 106.8,
    photoUrls: [],
    overallRating: 4,
    criteriaRating: { taste: 4, ambiance: 4, service: 4, price: 4 },
    menuItems: [],
    totalSpent: 50000,
    reviewText: 'Enak dan murah',
    tags: ['enak'],
    visitedAt: ts,
    createdAt: ts,
    ...o,
  };
};

describe('culinaryAnalytics', () => {
  test('extractAvailableMonths: extracts and sorts unique year-months descending', () => {
    const journals = [
      mockJournal({ visitedAt: '2026-11-15T10:00:00.000Z' }),
      mockJournal({ visitedAt: '2026-11-01T10:00:00.000Z' }),
      mockJournal({ visitedAt: '2026-10-20T10:00:00.000Z' }),
      mockJournal({ visitedAt: '2026-09-05T10:00:00.000Z' }),
    ];
    const months = extractAvailableMonths(journals);
    assert.deepEqual(months, ['2026-11', '2026-10', '2026-09']);
  });

  test('formatMonthLabel: formats YYYY-MM correctly into Indonesian or "Semua Waktu"', () => {
    assert.equal(formatMonthLabel('all'), 'Semua Waktu');
    const labelNov = formatMonthLabel('2026-11');
    assert.ok(labelNov.toLowerCase().includes('november') && labelNov.includes('2026'));
  });

  test('calculateMonthlyDigest: handles empty journals safely without errors', () => {
    const digest = calculateMonthlyDigest([], '2026-11');
    assert.equal(digest.totalSpent, 0);
    assert.equal(digest.totalVisits, 0);
    assert.equal(digest.averageSpentPerVisit, 0);
    assert.equal(digest.uniquePlacesCount, 0);
    assert.equal(digest.averageRating, null);
    assert.equal(digest.topPlaces.length, 0);
    assert.equal(digest.topDishes.length, 0);
  });

  test('calculateMonthlyDigest: filters specifically by month and calculates spending & categories', () => {
    const journals = [
      mockJournal({
        id: 'j1',
        placeId: 'p1',
        placeName: 'Resto Padang',
        mainCategory: 'food',
        totalSpent: 100000,
        overallRating: 5.0,
        visitedAt: '2026-11-05T12:00:00.000Z',
        menuItems: [{ id: 'm1', name: 'Rendang', price: 30000, rating: 5 }],
      }),
      mockJournal({
        id: 'j2',
        placeId: 'p2',
        placeName: 'Kopi Kenangan',
        mainCategory: 'drinks',
        totalSpent: 50000,
        overallRating: 4.0,
        visitedAt: '2026-11-12T12:00:00.000Z',
        menuItems: [{ id: 'm2', name: 'Kopi Kenangan Mantan', price: 25000, rating: 4 }],
      }),
      mockJournal({
        id: 'j3',
        placeId: 'p3',
        placeName: 'Bakmi GM',
        mainCategory: 'food',
        totalSpent: 80000,
        overallRating: 4.0,
        visitedAt: '2026-10-15T12:00:00.000Z', // Different month!
      }),
    ];

    const novDigest = calculateMonthlyDigest(journals, '2026-11');
    assert.equal(novDigest.totalVisits, 2);
    assert.equal(novDigest.totalSpent, 150000);
    assert.equal(novDigest.averageSpentPerVisit, 75000);
    assert.equal(novDigest.uniquePlacesCount, 2);
    assert.equal(novDigest.averageRating, 4.5);

    const foodCat = novDigest.categories.find((c) => c.category === 'food');
    assert.ok(foodCat);
    assert.equal(foodCat.spent, 100000);
    assert.equal(foodCat.percentage, 67); // 100000 / 150000 = 66.6% -> 67%

    const drinksCat = novDigest.categories.find((c) => c.category === 'drinks');
    assert.ok(drinksCat);
    assert.equal(drinksCat.spent, 50000);
    assert.equal(drinksCat.percentage, 33); // 50000 / 150000 = 33.3% -> 33%

    assert.equal(novDigest.topPlaces.length, 2);
    assert.equal(novDigest.topDishes.length, 2);
    assert.equal(novDigest.topDishes[0].name, 'Rendang');
  });

  test('calculateMonthlyDigest: supports "all" to compute all-time digest', () => {
    const journals = [
      mockJournal({ totalSpent: 100000, visitedAt: '2026-11-05T12:00:00.000Z' }),
      mockJournal({ totalSpent: 80000, visitedAt: '2026-10-15T12:00:00.000Z' }),
    ];
    const allDigest = calculateMonthlyDigest(journals, 'all');
    assert.equal(allDigest.totalVisits, 2);
    assert.equal(allDigest.totalSpent, 180000);
    assert.equal(allDigest.averageSpentPerVisit, 90000);
  });
});
