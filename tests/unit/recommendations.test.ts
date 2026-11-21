import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTasteProfile, rankRecommendations } from '../../src/features/recommendations/recommendationEngine';
import { Journal } from '../../src/models/journal';
import { NearbyPlace } from '../../src/types/places';
import { FoodPreferences } from '../../src/models/preferences';

const mockJournal = (id: string, overrides: Partial<Journal> = {}): Journal => ({
  id,
  userId: 'user-1',
  placeId: `place-${id}`,
  placeName: `Tempat ${id}`,
  placeAddress: 'Jl. Rasa No. 1',
  mainCategory: 'drinks',
  subCategory: 'cafe',
  subCategoryLabel: 'Kopi/Cafe',
  latitude: -6.2,
  longitude: 106.8,
  overallRating: 4.5,
  criteriaRating: { taste: 5, ambiance: 4, service: 4, price: 4 },
  menuItems: [{ name: 'Latte', price: 35000 }],
  totalSpent: 35000,
  tags: ['kopi', 'tenang'],
  photoUrls: [],
  visitedAt: '2026-10-20T10:00:00.000Z',
  createdAt: '2026-10-20T10:00:00.000Z',
  ...overrides,
});

const mockPlace = (id: string, overrides: Partial<NearbyPlace> = {}): NearbyPlace => ({
  id: `osm-${id}`,
  providerId: 'osm',
  name: `Cafe & Resto ${id}`,
  address: 'Jl. Kuliner No. 10',
  mainCategory: 'drinks',
  mainCategoryLabel: 'Minuman',
  subCategory: 'cafe',
  subCategoryLabel: 'Kopi/Cafe',
  latitude: -6.205,
  longitude: 106.805,
  distanceMeter: 800,
  tags: ['coffee', 'cafe'],
  ...overrides,
});

describe('AI Recommendation Engine', () => {
  test('buildTasteProfile: zero journals returns honest empty persona', () => {
    const preferences: FoodPreferences = {
      favoriteCategories: ['Kopi/Cafe'],
      preferredVenueTypes: ['Café'],
      recommendationPreferences: { enableAI: true, personalizedMenu: true },
    };
    const profile = buildTasteProfile([], preferences);
    assert.equal(profile.totalJournals, 0);
    assert.equal(profile.averageSpend, null);
    assert.equal(profile.topCategories.length, 0);
    assert.ok(profile.personaDescription.includes('Belum ada riwayat kunjungan'));
  });

  test('buildTasteProfile: aggregates top categories and average spend from journals', () => {
    const journals: Journal[] = [
      mockJournal('1', { subCategoryLabel: 'Kopi/Cafe', overallRating: 5.0, totalSpent: 40000 }),
      mockJournal('2', { subCategoryLabel: 'Kopi/Cafe', overallRating: 4.0, totalSpent: 60000 }),
      mockJournal('3', { subCategoryLabel: 'Bakery', overallRating: 4.0, totalSpent: 50000 }),
    ];
    const profile = buildTasteProfile(journals);
    assert.equal(profile.totalJournals, 3);
    assert.equal(profile.topCategories[0]?.category, 'Kopi/Cafe');
    assert.equal(profile.topCategories[0]?.count, 2);
    assert.equal(profile.averageSpend, 50000);
    assert.ok(profile.personaTitle.length > 0);
  });

  test('rankRecommendations: prioritizes unvisited places matching top categories', () => {
    const journals: Journal[] = [
      mockJournal('1', { placeId: 'osm-visited-1', subCategoryLabel: 'Kopi/Cafe', overallRating: 5.0 }),
    ];
    const profile = buildTasteProfile(journals);

    const places: NearbyPlace[] = [
      mockPlace('other', { subCategoryLabel: 'Wisata Alam', distanceMeter: 2000 }),
      mockPlace('match', { subCategoryLabel: 'Kopi/Cafe', distanceMeter: 500 }),
      mockPlace('visited-1', { subCategoryLabel: 'Kopi/Cafe', distanceMeter: 300 }),
    ];

    const visitedPlaceIds = new Set(['osm-visited-1']);
    const wishlistPlaceIds = new Set<string>();

    const ranked = rankRecommendations({
      tasteProfile: profile,
      nearbyPlaces: places,
      visitedPlaceIds,
      wishlistPlaceIds,
    });

    assert.equal(ranked.length, 3);
    // Unvisited matching place should be ranked first
    assert.equal(ranked[0]?.place.id, 'osm-match');
    assert.ok(ranked[0]?.matchScore >= 80);
    assert.equal(ranked[0]?.isAlreadyVisited, false);
    assert.ok(ranked[0]?.matchReasons.length > 0);

    // Visited place is marked isAlreadyVisited = true
    const visitedItem = ranked.find((r) => r.place.id === 'osm-visited-1');
    assert.ok(visitedItem);
    assert.equal(visitedItem.isAlreadyVisited, true);
  });

  test('rankRecommendations: recognizes wishlist status and generates transparent reason', () => {
    const profile = buildTasteProfile([mockJournal('1', { subCategoryLabel: 'Bakery' })]);
    const places: NearbyPlace[] = [
      mockPlace('bakery-1', { subCategoryLabel: 'Bakery', distanceMeter: 1200 }),
    ];

    const ranked = rankRecommendations({
      tasteProfile: profile,
      nearbyPlaces: places,
      visitedPlaceIds: new Set(),
      wishlistPlaceIds: new Set(['osm-bakery-1']),
    });

    assert.equal(ranked[0]?.isInWishlist, true);
    assert.ok(ranked[0]?.primaryReason.includes('Bakery'));
  });
});
