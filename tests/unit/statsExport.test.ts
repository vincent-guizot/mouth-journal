import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExportArchive } from '../../src/features/settings/exportArchive';
import { DiaryService } from '../../src/services/firebase/diaryService';
import { DEFAULT_APP_SETTINGS } from '../../src/models/preferences';
import type { Journal } from '../../src/models/journal';

const j = (o: Partial<Journal>): Journal => ({
  id: 'j', userId: 'u1', placeId: 'osm-node-1', placeName: 'A', placeAddress: '', mainCategory: 'drinks', subCategory: 'kopi',
  subCategoryLabel: 'Kopi/Cafe', latitude: null, longitude: null, photoUrls: [], overallRating: 4,
  criteriaRating: { taste: 4, ambiance: 4, service: 4, price: 4 }, menuItems: [], totalSpent: 1000, reviewText: '', tags: [],
  visitedAt: '2026-10-01T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z', ...o,
});

describe('DiaryService.calculateStats (no placeholder values)', () => {
  test('empty input yields nulls, not fake 4.7 / "Kopi/Cafe"', () => {
    const s = DiaryService.calculateStats([]);
    assert.equal(s.averageRating, null);
    assert.equal(s.favoriteCategory, null);
    assert.equal(s.totalVisits, 0);
  });
  test('unique places are counted by placeId, not by name', () => {
    const s = DiaryService.calculateStats([
      j({ id: '1', placeId: 'osm-node-1', placeName: 'Kopi Kenangan' }),
      j({ id: '2', placeId: 'osm-node-2', placeName: 'Kopi Kenangan' }),
      j({ id: '3', placeId: 'osm-node-1', overallRating: 2, mainCategory: 'food', subCategoryLabel: 'Restoran' }),
    ]);
    assert.equal(s.totalPlaces, 2);
    assert.equal(s.averageRating, 3.3);
    assert.equal(s.totalSpent, 3000);
    assert.equal(s.favoriteCategory, 'Kopi/Cafe');
  });
});

describe('Data export', () => {
  test('archive contains real records and totals', () => {
    const mw = {
      id: 'mw-1',
      userId: 'u1',
      placeId: 'osm-node-1',
      placeName: 'Kopi Kenangan',
      menuName: 'Kopi Kenangan Mantan',
      createdAt: '2026-10-01T00:00:00.000Z',
    };
    const a = buildExportArchive(
      { uid: 'u1', email: 'a@b.co', displayName: 'A' },
      [j({ id: '1' }), j({ id: '2', totalSpent: 500 })],
      [],
      DEFAULT_APP_SETTINGS,
      [mw],
      new Date('2026-11-01T00:00:00.000Z')
    );
    assert.equal(a.stats.totalJournals, 2);
    assert.equal(a.stats.totalSpent, 1500);
    assert.equal(a.stats.totalMenuWishlistItems, 1);
    assert.equal(a.menuWishlist.length, 1);
    assert.equal(a.exportedAt, '2026-11-01T00:00:00.000Z');
  });
  test('foreign records abort the export instead of being silently filtered', () => {
    assert.throws(() => buildExportArchive({ uid: 'u1', email: 'a@b.co', displayName: 'A' }, [j({ userId: 'u2' })], [], DEFAULT_APP_SETTINGS));
  });
});
