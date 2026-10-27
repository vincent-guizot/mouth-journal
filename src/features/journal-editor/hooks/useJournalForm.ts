import { useState } from 'react';
import { Alert } from 'react-native';
import { NearbyPlace } from '../../../types/places';
import { Journal } from '../../../models/journal';
import { journalRepository } from '../../../repositories';
import { ImageService } from '../../../services/firebase/imageService';
import { MenuItemRow, ExperienceRatings } from '../types';
import { JOURNAL_CATEGORIES } from '../constants/categories';

export interface UseJournalFormProps {
  initialPlace?: NearbyPlace | null;
  initialJournal?: Journal | null;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const DEFAULT_DEMO_PLACE: NearbyPlace = {
  id: 'tanamera-01',
  name: 'Tanamera Coffee Roastery',
  address: 'Senopati, Jakarta Selatan',
  latitude: -6.229746,
  longitude: 106.816431,
  mainCategory: 'drinks',
  mainCategoryLabel: 'Drinks',
  subCategory: 'cafe',
  subCategoryLabel: 'Kopi/Cafe',
  photoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80',
  ratingAverage: 4.2,
};

export function useJournalForm({
  initialPlace,
  initialJournal,
  userId,
  userName,
  onSuccess,
}: UseJournalFormProps) {
  // Photos: Kosong jika membuat jurnal baru, isi data lama jika mode edit
  const [photos, setPhotos] = useState<string[]>(
    initialJournal?.photoUrls || (initialPlace?.photoUrl ? [initialPlace.photoUrl] : [])
  );

  // Selected Place
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace>(
    initialPlace ||
      (initialJournal
        ? {
            id: initialJournal.placeId,
            name: initialJournal.placeName,
            address: initialJournal.placeAddress,
            latitude: initialJournal.latitude,
            longitude: initialJournal.longitude,
            mainCategory: initialJournal.mainCategory,
            mainCategoryLabel: initialJournal.mainCategory,
            subCategory: initialJournal.subCategory,
            subCategoryLabel: initialJournal.subCategoryLabel,
          }
        : {
            id: '',
            name: '',
            address: '',
            latitude: 0,
            longitude: 0,
            mainCategory: 'drinks',
            mainCategoryLabel: 'Drinks',
            subCategory: 'cafe',
            subCategoryLabel: 'Kopi/Cafe',
          })
  );

  // Visit date
  const initialVisitedAt = initialJournal?.visitedAt
    ? new Date(initialJournal.visitedAt)
    : new Date();
  const [visitedAt, setVisitedAt] = useState<Date>(initialVisitedAt);
  const visitDate = visitedAt.toLocaleDateString('id-ID', {
      day: '2-digit',
      weekday: 'long',
      month: 'short',
      year: 'numeric',
    });

  // Category
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialJournal?.subCategory || 'kopi'
  );

  // Menu items: Kosong jika jurnal baru
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>(
    initialJournal?.menuItems.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      rating: m.rating || 5,
      image: m.photoUrl || '',
    })) || []
  );

  // Experience Ratings: 0 jika jurnal baru, pakai nilai tersimpan jika mode edit
  const [experienceRatings, setExperienceRatings] = useState<ExperienceRatings>({
    rasa: initialJournal?.criteriaRating.taste || 0,
    suasana: initialJournal?.criteriaRating.ambiance || 0,
    pelayanan: initialJournal?.criteriaRating.service || 0,
    value: initialJournal?.criteriaRating.price || 0,
  });

  // Review Note: Kosong jika jurnal baru
  const [reviewNote, setReviewNote] = useState<string>(
    initialJournal?.reviewText || ''
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Photo handlers
  const handleAddPhoto = async () => {
    try {
      const uri = await ImageService.pickImage();
      if (uri) {
        setPhotos((prev) => [...prev, uri]);
      }
    } catch (err: any) {
      Alert.alert('Gagal Memilih Foto', err?.message || 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  const addPhotoUri = (uri: string) => setPhotos((prev) => [...prev, uri]);

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Menu handlers
  const handleAddMenu = (name: string, price: number, rating: number, image?: string) => {
    const newItem: MenuItemRow = {
      id: `m-${Date.now()}`,
      name: name || 'Menu Baru',
      price: price || 35000,
      rating: rating || 5,
      image: image || 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&auto=format&fit=crop&q=80',
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const handleRemoveMenu = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Criteria handler
  const setCriteriaRating = (key: keyof ExperienceRatings, val: number) => {
    setExperienceRatings((prev) => ({ ...prev, [key]: val }));
  };

  // Publish
  const handlePublish = async () => {
    if (!selectedPlace.name || selectedPlace.name.trim() === '') {
      Alert.alert('Perhatian', 'Nama tempat wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedPhotos: string[] = [];
      for (const p of photos) {
        if (p.startsWith('http')) {
          uploadedPhotos.push(p);
        } else {
          const cloudUrl = await ImageService.uploadImage(p, userId, 'journals');
          uploadedPhotos.push(cloudUrl);
        }
      }

      const avgScore =
        (experienceRatings.rasa +
          experienceRatings.suasana +
          experienceRatings.pelayanan +
          experienceRatings.value) /
        4;
      const overallRating = Math.round(avgScore * 10) / 10;
      const totalSpent = menuItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0);

      const mainCat =
        selectedCategory === 'kopi'
          ? 'drinks'
          : selectedCategory === 'lainnya'
          ? 'wisata'
          : 'food';

      const payload = {
        userId,
        userName,
        placeId: selectedPlace.id || `place_${Date.now()}`,
        placeName: selectedPlace.name,
        placeAddress: selectedPlace.address || 'Kawasan Sekitar',
        mainCategory: mainCat as 'food' | 'drinks' | 'wisata',
        subCategory: selectedCategory,
        subCategoryLabel: JOURNAL_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Kuliner',
        latitude: selectedPlace.latitude || -6.229746,
        longitude: selectedPlace.longitude || 106.816431,
        photoUrls: uploadedPhotos.length > 0 ? uploadedPhotos : photos,
        overallRating,
        criteriaRating: {
          taste: experienceRatings.rasa,
          ambiance: experienceRatings.suasana,
          service: experienceRatings.pelayanan,
          price: experienceRatings.value,
        },
        menuItems: menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          rating: m.rating,
          photoUrl: m.image,
        })),
        totalSpent,
        reviewText: reviewNote,
        tags: Array.from(new Set([...(initialJournal?.tags || []), 'Kuliner', selectedCategory])),
        visitedAt: visitedAt.toISOString(),
        createdAt: initialJournal?.createdAt || new Date().toISOString(),
      };

      if (initialJournal?.id) {
        await journalRepository.updateJournal(userId, initialJournal.id, payload);
      } else {
        await journalRepository.createJournal(userId, payload);
      }

      Alert.alert(
        initialJournal ? 'Jurnal Diperbarui! 🎉' : 'Jurnal Tersimpan! 🎉',
        `Catatan kunjungan ke "${selectedPlace.name}" berhasil disimpan ke koleksi pribadi Anda.`,
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (err: any) {
      console.error('[useJournalForm] Gagal menyimpan jurnal:', err);
      Alert.alert('Gagal Menyimpan', err?.message || 'Terjadi kesalahan saat menyimpan catatan.');
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
    setSelectedPlace,
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
