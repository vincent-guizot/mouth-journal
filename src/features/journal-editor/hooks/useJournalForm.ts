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
  // Photos
  const [photos, setPhotos] = useState<string[]>(
    initialJournal?.photoUrls ||
      (initialPlace?.photoUrl ? [initialPlace.photoUrl] : [
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
      ])
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
        : DEFAULT_DEMO_PLACE)
  );

  // Visit date & time
  const [visitDate, setVisitDate] = useState<string>('12 Okt 2026');
  const [visitTime, setVisitTime] = useState<string>('10:30');

  // Category
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialJournal?.subCategory || 'kopi'
  );

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>(
    initialJournal?.menuItems.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      rating: m.rating || 5,
      image: m.photoUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
    })) || [
      {
        id: 'm-1',
        name: 'Latte',
        price: 45000,
        rating: 5,
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'm-2',
        name: 'Croissant',
        price: 38000,
        rating: 4,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
      },
    ]
  );

  // Experience Ratings
  const [experienceRatings, setExperienceRatings] = useState<ExperienceRatings>({
    rasa: initialJournal?.criteriaRating.taste || 5,
    suasana: initialJournal?.criteriaRating.ambiance || 4,
    pelayanan: initialJournal?.criteriaRating.service || 4,
    value: initialJournal?.criteriaRating.price || 4,
  });

  // Review Note
  const [reviewNote, setReviewNote] = useState<string>(
    initialJournal?.reviewText ||
      'Tempat yang sangat nyaman untuk kerja atau sekadar ngobrol santai. Kopi arabika lokalnya berkarakter tebal dengan aftertaste manis floral. Croissant renyah bermentega gurih.'
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

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Menu handlers
  const handleAddMenu = (name: string, price: number, rating: number) => {
    const newItem: MenuItemRow = {
      id: `m-${Date.now()}`,
      name: name || 'Menu Baru',
      price: price || 35000,
      rating: rating || 5,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&auto=format&fit=crop&q=80',
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
        tags: ['Kuliner', selectedCategory],
        visitedAt: new Date().toISOString(),
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
    handleRemovePhoto,
    selectedPlace,
    setSelectedPlace,
    visitDate,
    setVisitDate,
    visitTime,
    setVisitTime,
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
