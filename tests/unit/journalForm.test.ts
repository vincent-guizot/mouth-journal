import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_PLACE,
  JournalFormError,
  applyManualPlaceEdit,
  buildJournalDraft,
  editorCategoryForJournal,
  placeSelectionFromPlace,
} from '../../src/features/journal-editor/buildJournalDraft';
import { JournalSchema } from '../../src/schemas/journalSchema';

const osmPlace = placeSelectionFromPlace({
  id: 'osm-way-77', providerId: 'osm', name: 'Kopi Way', address: 'Jl. A', mainCategory: 'drinks', mainCategoryLabel: '',
  subCategory: 'cafe', subCategoryLabel: 'Café', latitude: -6.2, longitude: 106.8, tags: [],
});
const now = new Date('2026-11-01T10:00:00.000Z');
const base = {
  place: osmPlace,
  categoryId: 'kopi',
  ratings: { rasa: 5, suasana: 4, pelayanan: 3, value: 3 },
  menuItems: [{ id: 'm1', name: 'Latte', price: 35000 }],
  photoUrls: [],
  reviewText: '  enak  ',
  visitedAt: new Date('2026-11-01T08:00:00.000Z'),
  now,
};

describe('buildJournalDraft (form → contract)', () => {
  test('initial 0 ratings block submit', () => {
    assert.throws(() => buildJournalDraft({ ...base, ratings: { rasa: 0, suasana: 0, pelayanan: 0, value: 0 } }), JournalFormError);
    assert.throws(() => buildJournalDraft({ ...base, ratings: { ...base.ratings, value: 0 } }), JournalFormError);
  });

  test('produces a draft that passes JournalSchema once the repository adds ownership fields', () => {
    const draft = buildJournalDraft(base);
    assert.equal(draft.overallRating, 3.8);
    assert.equal(draft.totalSpent, 35000);
    assert.equal(draft.placeId, 'osm-way-77');
    assert.equal(draft.mainCategory, 'drinks');
    assert.equal(draft.reviewText, 'enak');
    assert.equal(draft.menuItems[0].rating, undefined, 'no fake default rating');
    const r = JournalSchema.safeParse({ ...draft, id: 'x1', userId: 'u', createdAt: now.toISOString() });
    assert.equal(r.success, true, JSON.stringify(!r.success && r.error.issues));
  });

  test('future visit date and missing place are rejected', () => {
    assert.throws(() => buildJournalDraft({ ...base, visitedAt: new Date('2026-11-02T00:00:00.000Z') }), /masa depan/);
    assert.throws(() => buildJournalDraft({ ...base, place: EMPTY_PLACE }), JournalFormError);
  });

  test('"Lainnya" keeps the place main category instead of forcing wisata', () => {
    assert.equal(buildJournalDraft({ ...base, categoryId: 'lainnya' }).mainCategory, 'drinks');
  });

  test('renaming an OSM place detaches the OSM id and coordinates', () => {
    const edited = applyManualPlaceEdit(osmPlace, 'Tempat Lain', 'Jl. B');
    assert.match(edited.id, /^manual-/);
    assert.equal(edited.latitude, null);
    assert.equal(edited.providerId, 'manual');
    assert.equal(applyManualPlaceEdit(osmPlace, osmPlace.name, osmPlace.address), osmPlace, 'unchanged edit keeps identity');
    const again = applyManualPlaceEdit(edited, 'Tempat Lain 2', '');
    assert.equal(again.id, edited.id, 'manual place keeps its own id');
  });

  test('unknown stored subcategory maps to "lainnya" in the editor', () => {
    assert.equal(editorCategoryForJournal('cafe'), 'lainnya');
    assert.equal(editorCategoryForJournal('kopi'), 'kopi');
  });
});
