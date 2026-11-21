import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateVisitedPlaces,
  aggregateLoggedDishes,
} from '../../src/features/profile/profileAggregation';
import type { Journal } from '../../src/models/journal';

const mockJournal = (o: Partial<Journal>): Journal => {
  const ts = o.visitedAt || o.createdAt || '2026-10-01T12:00:00.000Z';
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
    totalSpent: 25000,
    reviewText: 'Enak dan murah',
    tags: ['enak'],
    visitedAt: ts,
    createdAt: ts,
    ...o,
  };
};

describe('aggregateVisitedPlaces', () => {
  test('returns empty array when journals list is empty', () => {
    assert.deepEqual(aggregateVisitedPlaces([]), []);
  });

  test('groups visited places by placeId with visit count and average rating', () => {
    const journals = [
      mockJournal({
        id: 'j1',
        placeId: 'osm-node-1',
        placeName: 'Kopi Kenangan',
        placeAddress: 'Mall A',
        subCategoryLabel: 'Kopi',
        overallRating: 4.0,
        createdAt: '2026-10-01T10:00:00.000Z',
        photoUrls: ['https://storage.googleapis.com/test/photo1.jpg'],
      }),
      mockJournal({
        id: 'j2',
        placeId: 'osm-node-1',
        placeName: 'Kopi Kenangan',
        placeAddress: 'Mall A',
        subCategoryLabel: 'Kopi',
        overallRating: 5.0,
        createdAt: '2026-10-15T10:00:00.000Z',
        photoUrls: ['https://storage.googleapis.com/test/photo2.jpg'],
      }),
      mockJournal({
        id: 'j3',
        placeId: 'osm-node-2',
        placeName: 'Bakmi GM',
        placeAddress: 'Mall B',
        subCategoryLabel: 'Bakmi',
        overallRating: 3.0,
        createdAt: '2026-10-10T10:00:00.000Z',
        photoUrls: [],
      }),
    ];

    const result = aggregateVisitedPlaces(journals);

    assert.equal(result.length, 2);

    // Should be sorted by latest visit date descending (osm-node-1 visited on 15 Oct, osm-node-2 on 10 Oct)
    assert.equal(result[0].placeId, 'osm-node-1');
    assert.equal(result[0].placeName, 'Kopi Kenangan');
    assert.equal(result[0].visitCount, 2);
    assert.equal(result[0].averageRating, 4.5);
    assert.equal(result[0].lastVisited, '2026-10-15T10:00:00.000Z');
    assert.equal(result[0].photoUrl, 'https://storage.googleapis.com/test/photo1.jpg');

    assert.equal(result[1].placeId, 'osm-node-2');
    assert.equal(result[1].placeName, 'Bakmi GM');
    assert.equal(result[1].visitCount, 1);
    assert.equal(result[1].averageRating, 3.0);
    assert.equal(result[1].lastVisited, '2026-10-10T10:00:00.000Z');
    assert.equal(result[1].photoUrl, undefined);
  });
});

describe('aggregateLoggedDishes', () => {
  test('returns empty array when journals have no menu items', () => {
    assert.deepEqual(aggregateLoggedDishes([]), []);
    assert.deepEqual(aggregateLoggedDishes([mockJournal({ menuItems: [] })]), []);
  });

  test('extracts and sorts dishes from journals by date descending', () => {
    const journals = [
      mockJournal({
        id: 'j1',
        placeId: 'osm-node-1',
        placeName: 'Kopi Mantap',
        createdAt: '2026-10-01T10:00:00.000Z',
        menuItems: [
          {
            id: 'm1',
            name: 'Es Kopi Susu',
            price: 18000,
            category: 'drink',
            rating: 5,
            isRecommended: true,
          },
        ],
      }),
      mockJournal({
        id: 'j2',
        placeId: 'osm-node-2',
        placeName: 'Warung Nasi',
        createdAt: '2026-10-05T10:00:00.000Z',
        menuItems: [
          {
            id: 'm2',
            name: 'Ayam Goreng',
            price: 25000,
            category: 'food',
            rating: 4,
            notes: 'Porsinya pas',
          },
        ],
      }),
    ];

    const dishes = aggregateLoggedDishes(journals);

    assert.equal(dishes.length, 2);
    // j2 is newer (Oct 5 vs Oct 1)
    assert.equal(dishes[0].dishName, 'Ayam Goreng');
    assert.equal(dishes[0].placeName, 'Warung Nasi');
    assert.equal(dishes[0].price, 25000);
    assert.equal(dishes[0].category, 'food');
    assert.equal(dishes[0].rating, 4);

    assert.equal(dishes[1].dishName, 'Es Kopi Susu');
    assert.equal(dishes[1].placeName, 'Kopi Mantap');
    assert.equal(dishes[1].price, 18000);
    assert.equal(dishes[1].isRecommended, true);
  });
});
