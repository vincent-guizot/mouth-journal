import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { JournalSchema, LocalJournalSchema, MenuItemSchema, computeOverallRating } from '../../src/schemas/journalSchema';
import { WishlistItemSchema, WishlistAddInputSchema } from '../../src/schemas/wishlistSchema';
import { UserProfileSchema, LocalUserProfileSchema } from '../../src/schemas/userSchema';
import { AppSettingsSchema, PreferencesPatchSchema } from '../../src/schemas/preferencesSchema';
import { PlaceSchema } from '../../src/schemas/placeSchema';

const created = '2026-10-26T08:30:00.000Z';
const journal = (o: Record<string, unknown> = {}) => ({
  id: 'abcDEF123',
  userId: 'u1',
  placeId: 'osm-node-1',
  placeName: 'Kopi',
  placeAddress: '',
  mainCategory: 'drinks',
  subCategory: 'kopi',
  subCategoryLabel: 'Kopi/Cafe',
  latitude: -6.2,
  longitude: 106.8,
  photoUrls: ['https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg?alt=media'],
  overallRating: 3.8,
  criteriaRating: { taste: 5, ambiance: 4, service: 3, price: 3 },
  menuItems: [{ id: 'm1', name: 'Latte', price: 35000, rating: 5 }],
  totalSpent: 35000,
  reviewText: '',
  tags: [],
  visitedAt: '2026-10-26T08:00:00.000Z',
  createdAt: created,
  ...o,
});

const fails = (r: { success: boolean }) => assert.equal(r.success, false);

describe('JournalSchema', () => {
  test('accepts a valid journal', () => {
    const r = JournalSchema.safeParse(journal());
    assert.equal(r.success, true, JSON.stringify(!r.success && r.error.issues));
  });

  test('computeOverallRating is the 1-decimal mean', () => {
    assert.equal(computeOverallRating({ taste: 5, ambiance: 4, service: 3, price: 3 }), 3.8);
    assert.equal(computeOverallRating({ taste: 1, ambiance: 1, service: 1, price: 2 }), 1.3);
    assert.equal(computeOverallRating({ taste: 5, ambiance: 5, service: 5, price: 5 }), 5);
  });

  const invalid: [string, Record<string, unknown>][] = [
    ['criteria 0 (unrated)', { criteriaRating: { taste: 0, ambiance: 4, service: 3, price: 3 }, overallRating: 2.5 }],
    ['criteria 6', { criteriaRating: { taste: 6, ambiance: 4, service: 3, price: 3 }, overallRating: 4 }],
    ['fractional criteria', { criteriaRating: { taste: 4.5, ambiance: 4, service: 3, price: 3 }, overallRating: 3.6 }],
    ['overall inconsistent', { overallRating: 4.5 }],
    ['overall 6.5', { overallRating: 6.5 }],
    ['http photo', { photoUrls: ['http://insecure.example.com/a.jpg'] }],
    ['local photo in cloud schema', { photoUrls: ['file:///data/a.jpg'] }],
    ['not a url', { photoUrls: ['photo.jpg'] }],
    ['menu photo local', { menuItems: [{ id: 'm1', name: 'Latte', price: 35000, photoUrl: 'file:///a.jpg' }] }],
    ['negative price', { menuItems: [{ id: 'm1', name: 'Latte', price: -1 }], totalSpent: -1 }],
    ['totalSpent mismatch', { totalSpent: 1 }],
    ['visitedAt date-only', { visitedAt: '2026-10-26' }],
    ['visitedAt in the future vs createdAt', { visitedAt: '2026-12-01T00:00:00.000Z' }],
    ['updatedAt before createdAt', { updatedAt: '2026-01-01T00:00:00.000Z' }],
    ['lat without lon', { latitude: -6.2, longitude: null }],
    ['latitude out of range', { latitude: 100 }],
    ['placeId with spaces', { placeId: 'Kopi Senopati' }],
    ['empty placeName', { placeName: '  ' }],
    ['unknown category', { mainCategory: 'bar' }],
  ];
  for (const [name, o] of invalid) test(`rejects ${name}`, () => fails(JournalSchema.safeParse(journal(o))));

  test('manual place with null coordinates is valid', () => {
    assert.equal(JournalSchema.safeParse(journal({ latitude: null, longitude: null, placeId: 'manual-abc' })).success, true);
  });

  test('LocalJournalSchema (demo mode) accepts device URIs; still rejects garbage', () => {
    assert.equal(LocalJournalSchema.safeParse(journal({ photoUrls: ['file:///data/a.jpg', 'content://media/1'] })).success, true);
    fails(LocalJournalSchema.safeParse(journal({ photoUrls: ['javascript:alert(1)'] })));
  });

  test('MenuItemSchema requires a name and integer price', () => {
    fails(MenuItemSchema.safeParse({ id: 'm', name: '', price: 1 }));
    fails(MenuItemSchema.safeParse({ id: 'm', name: 'A', price: 1.5 }));
    assert.equal(MenuItemSchema.safeParse({ id: 'm', name: 'A', price: 0 }).success, true);
  });
});

describe('WishlistItemSchema', () => {
  const item = (o: Record<string, unknown> = {}) => ({
    id: 'osm-way-1', userId: 'u1', placeId: 'osm-way-1', placeName: 'X', placeAddress: '', mainCategory: 'food',
    subCategory: 'bakery', subCategoryLabel: 'Bakery', latitude: 1, longitude: 2, createdAt: created, ...o,
  });
  test('valid item', () => assert.equal(WishlistItemSchema.safeParse(item()).success, true));
  test('id must equal placeId', () => fails(WishlistItemSchema.safeParse(item({ id: 'wish_123' }))));
  test('placeId cannot be a place name', () => fails(WishlistItemSchema.safeParse(item({ id: 'Kopi Kenangan', placeId: 'Kopi Kenangan' }))));
  test('coordinates are required', () => fails(WishlistItemSchema.safeParse(item({ latitude: undefined }))));
  test('add input rejects http photo', () => fails(WishlistAddInputSchema.safeParse({ ...item(), photoUrl: 'http://a.b/c.jpg' })));
});

describe('UserProfileSchema / AppSettings / Place', () => {
  const p = { uid: 'u', email: 'a@b.co', displayName: 'A' };
  test('valid profile', () => assert.equal(UserProfileSchema.safeParse(p).success, true));
  test('invalid email', () => fails(UserProfileSchema.safeParse({ ...p, email: 'nope' })));
  test('bad username', () => fails(UserProfileSchema.safeParse({ ...p, username: 'Has Space' })));
  test('cloud profile rejects local avatar, demo profile accepts it', () => {
    fails(UserProfileSchema.safeParse({ ...p, photoURL: 'file:///a.jpg' }));
    assert.equal(LocalUserProfileSchema.safeParse({ ...p, photoURL: 'file:///a.jpg' }).success, true);
  });
  test('settings radius bounds', () => {
    const base = { foodPreferences: { recommendationPreferences: {} } };
    assert.equal(AppSettingsSchema.safeParse({ ...base, searchRadiusKm: 5 }).success, true);
    fails(AppSettingsSchema.safeParse({ ...base, searchRadiusKm: 0 }));
    fails(AppSettingsSchema.safeParse({ ...base, searchRadiusKm: 21 }));
  });
  test('preferences patch is strict (legacy keys like themeMode rejected)', () => {
    fails(PreferencesPatchSchema.safeParse({ themeMode: 'dark' }));
    assert.equal(PreferencesPatchSchema.safeParse({ appearance: 'dark', favoriteCategories: [] }).success, true);
  });
  test('place schema rejects fabricated rating ranges and http website', () => {
    const place = { id: 'osm-node-1', providerId: 'osm', name: 'A', mainCategory: 'food', latitude: 1, longitude: 2 };
    assert.equal(PlaceSchema.safeParse(place).success, true);
    fails(PlaceSchema.safeParse({ ...place, ratingAverage: 0 }));
    fails(PlaceSchema.safeParse({ ...place, website: 'http://x.com' }));
    fails(PlaceSchema.safeParse({ ...place, latitude: undefined }));
  });
});
