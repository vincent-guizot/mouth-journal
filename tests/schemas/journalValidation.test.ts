import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JournalSchema, MenuItemSchema, CriteriaRatingSchema } from '../../src/schemas/journalSchema.ts';
import { WishlistItemSchema } from '../../src/schemas/wishlistSchema.ts';
import { UserProfileSchema } from '../../src/schemas/userSchema.ts';
import { AppSettingsSchema } from '../../src/schemas/preferencesSchema.ts';

describe('Zod Domain Validation & Data Integrity Suite', () => {
  test('JournalSchema accepts valid complete journal payload', () => {
    const validJournal = {
      id: 'journal_12345',
      userId: 'user_vince',
      placeId: 'place_999',
      placeName: 'Kopi Kenangan Senopati',
      placeAddress: 'Jl. Senopati No. 12, Jakarta',
      mainCategory: 'drinks' as const,
      subCategory: 'cafe',
      subCategoryLabel: 'Coffee & Cafe',
      reviewText: 'Espresso yang seimbang dengan catatan aroma kacang dan karamel.',
      overallRating: 4.8,
      criteriaRating: {
        taste: 5,
        ambiance: 4.5,
        service: 4.8,
        price: 4.5,
      },
      menuItems: [
        {
          id: 'menu_1',
          name: 'Pandan Latte',
          price: 38000,
          rating: 4.8,
          photoUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772',
        },
      ],
      photoUrls: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'],
      tags: ['Kopi', 'Espresso', 'Senopati'],
      visitedAt: '2026-10-26T08:00:00.000Z',
      createdAt: '2026-10-26T08:30:00.000Z',
      updatedAt: '2026-10-26T08:30:00.000Z',
      latitude: -6.2297,
      longitude: 106.8164,
    };

    const result = JournalSchema.safeParse(validJournal);
    assert.equal(result.success, true);
  });

  test('JournalSchema rejects invalid rating outside 1..5 bounds', () => {
    const invalidRatingJournal = {
      id: 'journal_bad_rating',
      userId: 'user_vince',
      placeId: 'place_999',
      placeName: 'Test Cafe',
      placeAddress: 'Jakarta',
      mainCategory: 'drinks' as const,
      subCategory: 'cafe',
      subCategoryLabel: 'Cafe',
      reviewText: 'Good coffee',
      overallRating: 6.5, // INVALID: Max is 5
      criteriaRating: { taste: 5, ambiance: 4, service: 4, price: 4 },
      visitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      latitude: -6.2,
      longitude: 106.8,
    };

    const result = JournalSchema.safeParse(invalidRatingJournal);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some((issue) => issue.path.includes('overallRating')));
    }
  });

  test('WishlistItemSchema enforces user ownership and required fields', () => {
    const validWishlist = {
      id: 'wish_001',
      userId: 'user_vince',
      placeId: 'place_123',
      placeName: 'Sawo Kecik Roastery',
      placeAddress: 'Jl. Wijaya No. 8',
      mainCategory: 'drinks' as const,
      subCategory: 'cafe',
      latitude: -6.241,
      longitude: 106.802,
      createdAt: new Date().toISOString(),
    };

    const resValid = WishlistItemSchema.safeParse(validWishlist);
    assert.equal(resValid.success, true);

    // Missing userId must fail
    const invalidWishlist = { ...validWishlist, userId: undefined };
    const resInvalid = WishlistItemSchema.safeParse(invalidWishlist);
    assert.equal(resInvalid.success, false);
  });

  test('AppSettingsSchema strictly validates appearance and km units', () => {
    const validSettings = {
      appearance: 'light' as const,
      locationPermissionsGranted: true,
      searchRadiusKm: 3.5,
      useLocationForJournals: true,
      distanceUnit: 'km' as const,
      foodPreferences: {
        favoriteCategories: ['Coffee', 'Pastry'],
        preferredVenueTypes: ['Café'],
        recommendationPreferences: {
          enableAI: true,
          personalizedMenu: true,
        },
      },
      appVersion: '1.0.0',
    };

    const result = AppSettingsSchema.safeParse(validSettings);
    assert.equal(result.success, true);

    // Reject invalid distance unit (e.g. miles)
    const invalidSettings = { ...validSettings, distanceUnit: 'miles' };
    const resInvalid = AppSettingsSchema.safeParse(invalidSettings);
    assert.equal(resInvalid.success, false);
  });
});
