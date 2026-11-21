import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIdParam, parseJournalInitialData, parseJsonParam, parsePlaceInitialData, singleParam } from '../../src/navigation/routeParams';
import { PlaceSchema } from '../../src/schemas/placeSchema';

const place = { id: 'osm-node-1', providerId: 'osm', name: 'Kopi', mainCategory: 'drinks', latitude: -6.2, longitude: 106.8 };
const journal = {
  id: 'j1', userId: 'u1', placeId: 'osm-node-1', placeName: 'Kopi', placeAddress: '', mainCategory: 'drinks', subCategory: 'kopi',
  subCategoryLabel: 'Kopi/Cafe', latitude: null, longitude: null, photoUrls: [], overallRating: 4,
  criteriaRating: { taste: 4, ambiance: 4, service: 4, price: 4 }, menuItems: [], totalSpent: 0, reviewText: '', tags: [],
  visitedAt: '2026-10-01T00:00:00.000Z', createdAt: '2026-10-01T01:00:00.000Z',
};

describe('Route param contracts', () => {
  test('array params use the first value; empty string is absent', () => {
    assert.equal(singleParam(['a', 'b']), 'a');
    assert.equal(singleParam(''), undefined);
  });

  test('ids are validated (no path separators or spaces)', () => {
    assert.equal(parseIdParam('osm-way-5'), 'osm-way-5');
    assert.equal(parseIdParam('../users/x'), null);
    assert.equal(parseIdParam('Kopi Senopati'), null);
    assert.equal(parseIdParam(undefined), null);
  });

  test('initialData: invalid JSON and schema failures are reported, not cast', () => {
    assert.deepEqual(parseJsonParam('{bad', PlaceSchema), { status: 'invalid', reason: 'JSON tidak valid' });
    const r = parseJsonParam(JSON.stringify({ ...place, latitude: 'x' }), PlaceSchema);
    assert.equal(r.status, 'invalid');
    assert.equal(parseJsonParam(undefined, PlaceSchema).status, 'absent');
  });

  test('place initialData must match the path id', () => {
    assert.equal(parsePlaceInitialData('osm-node-1', JSON.stringify(place))?.name, 'Kopi');
    assert.equal(parsePlaceInitialData('osm-node-2', JSON.stringify(place)), null);
    // Legacy screens sent fabricated ratings; out-of-contract data is dropped.
    assert.equal(parsePlaceInitialData('osm-node-1', JSON.stringify({ ...place, ratingAverage: 0 })), null);
  });

  test('journal initialData must match path id AND the signed-in owner', () => {
    assert.equal(parseJournalInitialData('j1', 'u1', JSON.stringify(journal))?.id, 'j1');
    assert.equal(parseJournalInitialData('j1', 'u2', JSON.stringify(journal)), null, 'other user');
    assert.equal(parseJournalInitialData('j2', 'u1', JSON.stringify(journal)), null, 'id mismatch');
    assert.equal(parseJournalInitialData('j1', 'u1', JSON.stringify({ ...journal, overallRating: 5 })), null, 'inconsistent rating');
  });
});
