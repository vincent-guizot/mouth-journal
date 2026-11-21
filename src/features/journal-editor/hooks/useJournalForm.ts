import { useState } from 'react';
import { NearbyPlace } from '../../../models/place';
import { Journal } from '../../../models/journal';
import { journalRepository } from '../../../repositories';
import { SyncStatus } from '../../../repositories/sync/types';
import { ImageService, isRemoteImageUrl } from '../../../services/firebase/imageService';
import { generateId } from '../../../utils/ids';
import { feedback } from '../../../components/feedback';
import { ExperienceRatings, JournalPlaceSelection, MenuItemRow } from '../types';
import {
  EMPTY_PLACE,
  applyManualPlaceEdit,
  buildJournalDraft,
  editorCategoryForJournal,
  placeSelectionFromJournal,
  placeSelectionFromPlace,
} from '../buildJournalDraft';

export interface UseJournalFormProps {
  initialPlace?: NearbyPlace | null;
  initialJournal?: Journal | null;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const SYNC_MESSAGES: Record<SyncStatus, string> = {
  synced: 'Tersimpan dan tersinkron ke cloud.',
  pending: 'Tersimpan di perangkat. Akan disinkronkan otomatis saat koneksi kembali.',
  local: 'Tersimpan di perangkat ini (mode demo, tanpa cloud).',
};

export function useJournalForm({ initialPlace, initialJournal, userId, userName, onSuccess }: UseJournalFormProps) {
  const [photos, setPhotos] = useState<string[]>(initialJournal?.photoUrls ?? []);

  const [selectedPlace, setSelectedPlace] = useState<JournalPlaceSelection>(
    initialPlace
      ? placeSelectionFromPlace(initialPlace)
      : initialJournal
      ? placeSelectionFromJournal(initialJournal)
      : EMPTY_PLACE
  );

  const [visitedAt, setVisitedAt] = useState<Date>(
    initialJournal?.visitedAt ? new Date(initialJournal.visitedAt) : new Date()
  );
  const visitDate = visitedAt.toLocaleDateString('id-ID', {
    day: '2-digit',
    weekday: 'long',
    month: 'short',
    year: 'numeric',
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialJournal ? editorCategoryForJournal(initialJournal.subCategory) : initialPlace?.mainCategory === 'drinks' ? 'kopi' : 'restoran'
  );

  const [menuItems, setMenuItems] = useState<MenuItemRow[]>(
    initialJournal?.menuItems.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      rating: m.rating,
      image: m.photoUrl,
    })) ?? []
  );

  // 0 = not rated yet; submit is blocked until every criterion is 1..5.
  const [experienceRatings, setExperienceRatings] = useState<ExperienceRatings>({
    rasa: initialJournal?.criteriaRating.taste ?? 0,
    suasana: initialJournal?.criteriaRating.ambiance ?? 0,
    pelayanan: initialJournal?.criteriaRating.service ?? 0,
    value: initialJournal?.criteriaRating.price ?? 0,
  });

  const [reviewNote, setReviewNote] = useState<string>(initialJournal?.reviewText ?? '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddPhoto = async () => {
    try {
      const uri = await ImageService.pickImage();
      if (uri) setPhotos((prev) => [...prev, uri]);
    } catch (err) {
      feedback.showAlert('Gagal Memilih Foto', err instanceof Error ? err.message : String(err));
    }
  };

  const addPhotoUri = (uri: string) => setPhotos((prev) => [...prev, uri]);
  const handleRemovePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const handleAddMenu = (name: string, price: number, rating?: number, image?: string) => {
    setMenuItems((prev) => [...prev, { id: `m-${generateId(10)}`, name, price, rating, image }]);
  };
  const handleRemoveMenu = (id: string) => setMenuItems((prev) => prev.filter((item) => item.id !== id));

  const setCriteriaRating = (key: keyof ExperienceRatings, val: number) =>
    setExperienceRatings((prev) => ({ ...prev, [key]: val }));

  const editPlaceManually = (name: string, address: string) =>
    setSelectedPlace((current) => applyManualPlaceEdit(current, name, address));

  /** Uploads every local image once. Throws (nothing saved) if any upload fails. */
  const uploadLocalImages = async (): Promise<Map<string, string>> => {
    const local = new Set<string>();
    photos.forEach((p) => !isRemoteImageUrl(p) && local.add(p));
    menuItems.forEach((m) => m.image && !isRemoteImageUrl(m.image) && local.add(m.image));
    const mapping = new Map<string, string>();
    for (const uri of local) {
      const folder = photos.includes(uri) ? 'journals' : 'menus';
      mapping.set(uri, (await ImageService.upload(uri, userId, folder)).url);
    }
    return mapping;
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      // Validate the form before spending bandwidth on uploads.
      buildJournalDraft({
        place: selectedPlace,
        categoryId: selectedCategory,
        ratings: experienceRatings,
        menuItems,
        photoUrls: [],
        reviewText: reviewNote,
        visitedAt,
      });

      let uploaded: Map<string, string> = new Map();
      let uploadFailed = false;
      const localPhotos = photos.filter((p) => !isRemoteImageUrl(p));

      try {
        uploaded = await uploadLocalImages();
      } catch {
        // Offline or upload failure: keep local photos in pendingPhotoUris
        uploadFailed = true;
      }

      const resolve = (uri: string) => uploaded.get(uri) ?? uri;
      const cloudPhotoUrls = uploadFailed
        ? photos.filter(isRemoteImageUrl)
        : photos.map(resolve).filter(isRemoteImageUrl);
      const pendingUris = uploadFailed && localPhotos.length > 0 ? localPhotos : undefined;

      const draft = buildJournalDraft({
        place: selectedPlace,
        categoryId: selectedCategory,
        ratings: experienceRatings,
        menuItems: menuItems.map((m) => ({ ...m, image: m.image ? resolve(m.image) : undefined })),
        photoUrls: cloudPhotoUrls,
        pendingPhotoUris: pendingUris,
        reviewText: reviewNote,
        visitedAt,
        userName,
        existingTags: initialJournal?.tags,
      });

      const result = initialJournal?.id
        ? await journalRepository.updateJournal(userId, initialJournal.id, draft)
        : await journalRepository.createJournal(userId, draft);

      const message = uploadFailed
        ? `"${draft.placeName}": Tersimpan di perangkat. Foto akan diunggah otomatis saat online.`
        : `"${draft.placeName}": ${SYNC_MESSAGES[result.sync]}`;

      // Navigate independently of the dialog; feedback displays toast and alert across web and mobile.
      feedback.showAlert(initialJournal ? 'Jurnal Diperbarui' : 'Jurnal Tersimpan', message);
      onSuccess();
    } catch (err) {
      feedback.showAlert('Gagal Menyimpan', err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    photos,
    handleAddPhoto,
    addPhotoUri,
    handleRemovePhoto,
    selectedPlace,
    editPlaceManually,
    visitDate,
    visitedAt,
    setVisitedAt,
    selectedCategory,
    setSelectedCategory,
    menuItems,
    handleAddMenu,
    handleRemoveMenu,
    experienceRatings,
    setCriteriaRating,
    reviewNote,
    setReviewNote,
    isSubmitting,
    handlePublish,
  };
}
