import { Journal, JournalDraft } from '../../models/journal';
import { NearbyPlace } from '../../models/place';
import { computeOverallRating } from '../../schemas/journalSchema';
import { generateId } from '../../utils/ids';
import { JOURNAL_CATEGORY_DEFS } from './constants/categoryDefs';
import { ExperienceRatings, JournalPlaceSelection, MenuItemRow } from './types';

export class JournalFormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalFormError';
  }
}

export const EMPTY_PLACE: JournalPlaceSelection = {
  id: '',
  providerId: 'manual',
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  mainCategory: 'food',
};

export const placeSelectionFromPlace = (p: NearbyPlace): JournalPlaceSelection => ({
  id: p.id,
  providerId: p.providerId,
  name: p.name,
  address: p.address,
  latitude: p.latitude,
  longitude: p.longitude,
  mainCategory: p.mainCategory,
  subCategory: p.subCategory || undefined,
  subCategoryLabel: p.subCategoryLabel || undefined,
  photoUrl: p.photoUrl,
});

export const placeSelectionFromJournal = (j: Journal): JournalPlaceSelection => ({
  id: j.placeId,
  providerId: j.placeId.startsWith('osm-') ? 'osm' : 'manual',
  name: j.placeName,
  address: j.placeAddress,
  latitude: j.latitude,
  longitude: j.longitude,
  mainCategory: j.mainCategory,
  subCategory: j.subCategory,
  subCategoryLabel: j.subCategoryLabel,
});

/**
 * Applies a manual name/address edit. If the user changes the identity of an OSM
 * place, it becomes a manual place with its own ID and no (unverified) coordinates,
 * so an OSM ID is never attached to a different place.
 */
export const applyManualPlaceEdit = (
  current: JournalPlaceSelection,
  name: string,
  address: string
): JournalPlaceSelection => {
  const trimmedName = name.trim();
  if (!trimmedName) throw new JournalFormError('Nama tempat wajib diisi.');
  const trimmedAddress = address.trim();
  if (current.id && trimmedName === current.name && trimmedAddress === current.address) return current;
  if (current.id && current.providerId === 'manual') {
    return { ...current, name: trimmedName, address: trimmedAddress };
  }
  return {
    ...EMPTY_PLACE,
    mainCategory: current.mainCategory,
    id: `manual-${generateId()}`,
    providerId: 'manual',
    name: trimmedName,
    address: trimmedAddress,
  };
};

/** Category id stored on a journal → editor category; unknown subcategories map to 'lainnya'. */
export const editorCategoryForJournal = (subCategory: string | undefined): string =>
  JOURNAL_CATEGORY_DEFS.some((c) => c.id === subCategory) ? (subCategory as string) : 'lainnya';

export interface JournalFormValues {
  place: JournalPlaceSelection;
  categoryId: string;
  ratings: ExperienceRatings;
  menuItems: MenuItemRow[];
  /** Must already be uploaded (https) unless in demo mode. */
  photoUrls: string[];
  pendingPhotoUris?: string[];
  reviewText: string;
  visitedAt: Date;
  userName?: string;
  existingTags?: string[];
  now?: Date;
}

/**
 * Converts editor state to a JournalDraft. Throws JournalFormError for anything the
 * user must fix (unrated criteria, missing place, future date, bad price).
 */
export const buildJournalDraft = (v: JournalFormValues): JournalDraft => {
  if (!v.place.name.trim()) throw new JournalFormError('Nama tempat wajib diisi.');
  if (!v.place.id) throw new JournalFormError('Pilih tempat dari pencarian atau isi tempat secara manual.');

  const r = v.ratings;
  const unrated = (Object.entries(r) as [keyof ExperienceRatings, number][]).filter(
    ([, val]) => !Number.isInteger(val) || val < 1 || val > 5
  );
  if (unrated.length > 0) {
    throw new JournalFormError('Beri rating 1–5 bintang untuk Rasa, Suasana, Pelayanan, dan Value for Money.');
  }

  const now = v.now ?? new Date();
  if (Number.isNaN(v.visitedAt.getTime())) throw new JournalFormError('Tanggal kunjungan tidak valid.');
  if (v.visitedAt.getTime() > now.getTime() + 5 * 60 * 1000) {
    throw new JournalFormError('Tanggal kunjungan tidak boleh di masa depan.');
  }

  for (const m of v.menuItems) {
    if (!m.name.trim()) throw new JournalFormError('Nama menu wajib diisi.');
    if (!Number.isInteger(m.price) || m.price < 0) throw new JournalFormError(`Harga "${m.name}" tidak valid.`);
  }

  const category = JOURNAL_CATEGORY_DEFS.find((c) => c.id === v.categoryId);
  if (!category) throw new JournalFormError('Pilih kategori.');
  const criteriaRating = { taste: r.rasa, ambiance: r.suasana, service: r.pelayanan, price: r.value };

  return {
    userName: v.userName || undefined,
    placeId: v.place.id,
    placeName: v.place.name.trim(),
    placeAddress: v.place.address.trim(),
    mainCategory: category.mainCategory ?? v.place.mainCategory,
    subCategory: category.id,
    subCategoryLabel: category.label,
    latitude: v.place.latitude,
    longitude: v.place.longitude,
    photoUrls: v.photoUrls,
    pendingPhotoUris: v.pendingPhotoUris && v.pendingPhotoUris.length > 0 ? v.pendingPhotoUris : undefined,
    criteriaRating,
    overallRating: computeOverallRating(criteriaRating),
    menuItems: v.menuItems.map((m) => ({
      id: m.id,
      name: m.name.trim(),
      price: m.price,
      ...(m.rating !== undefined && { rating: m.rating }),
      ...(m.image && { photoUrl: m.image }),
    })),
    totalSpent: v.menuItems.reduce((sum, m) => sum + m.price, 0),
    reviewText: v.reviewText.trim(),
    tags: Array.from(new Set([...(v.existingTags ?? []), category.label])),
    visitedAt: v.visitedAt.toISOString(),
  };
};
