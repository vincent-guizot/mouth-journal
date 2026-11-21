import { useState, useEffect, useCallback, useMemo } from 'react';
import { NearbyPlace, UserLocation } from '../../../types/places';
import { placesService, PlacesProviderError } from '../../../services/places/placesService';
import { userPreferencesRepository, wishlistRepository } from '../../../repositories';
import { ExploreCategory } from '../components/ExploreCategoryPills';
import { feedback } from '../../../components/feedback';

export interface UseExploreScreenProps {
  userLocation: UserLocation;
  userId: string;
}

const describePlacesError = (err: unknown): string => {
  if (err instanceof PlacesProviderError) {
    switch (err.kind) {
      case 'timeout':
        return 'OpenStreetMap tidak merespons tepat waktu. Coba lagi.';
      case 'rate_limited':
        return 'Server OpenStreetMap sedang membatasi permintaan. Tunggu sebentar lalu coba lagi.';
      case 'network':
        return 'Tidak ada koneksi ke OpenStreetMap. Periksa internet Anda.';
      default:
        return `Gagal memuat tempat dari OpenStreetMap (${err.message}).`;
    }
  }
  return err instanceof Error ? err.message : String(err);
};

/**
 * Explore data comes only from placesService (OSM). No mock pins or ratings: on
 * failure the screen gets `error`, on no results an empty list.
 */
export function useExploreScreen({ userLocation, userId }: UseExploreScreenProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExploreCategory>('all');
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    userPreferencesRepository
      .getSettings(userId)
      .then((s) => active && setRadiusKm(s.searchRadiusKm))
      .catch((err) => {
        console.warn('[Explore] Preferensi radius gagal dimuat, memakai 3 km:', err);
        if (active) setRadiusKm(3);
      });
    wishlistRepository
      .getWishlist(userId)
      .then((items) => active && setWishlistedIds(new Set(items.map((w) => w.placeId))))
      .catch((err) => active && setError(`Wishlist gagal dimuat: ${err instanceof Error ? err.message : String(err)}`));
    return () => {
      active = false;
    };
  }, [userId]);

  const fetchPlaces = useCallback(async (): Promise<{ places: NearbyPlace[]; error: string | null } | null> => {
    if (radiusKm === null) return null;
    try {
      const results = await placesService.searchNearby(userLocation.latitude, userLocation.longitude, radiusKm * 1000, selectedCategory);
      return { places: results, error: null };
    } catch (err) {
      return { places: [], error: describePlacesError(err) };
    }
  }, [userLocation.latitude, userLocation.longitude, selectedCategory, radiusKm]);

  const apply = useCallback((r: { places: NearbyPlace[]; error: string | null } | null) => {
    if (!r) return;
    setPlaces(r.places);
    setError(r.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchPlaces().then((r) => active && apply(r));
    return () => {
      active = false;
    };
  }, [fetchPlaces, apply]);

  const loadPlaces = useCallback(() => fetchPlaces().then(apply), [fetchPlaces, apply]);

  const handleToggleWishlist = async (place: NearbyPlace) => {
    const isSaved = wishlistedIds.has(place.id);
    try {
      const { sync } = isSaved
        ? await wishlistRepository.removeFromWishlist(userId, place.id)
        : await wishlistRepository.addToWishlist(userId, {
            placeId: place.id,
            placeName: place.name,
            placeAddress: place.address,
            mainCategory: place.mainCategory,
            subCategory: place.subCategory || place.mainCategory,
            subCategoryLabel: place.subCategoryLabel || place.mainCategoryLabel || place.mainCategory,
            latitude: place.latitude,
            longitude: place.longitude,
            photoUrl: place.photoUrl,
          });
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(place.id);
        else next.add(place.id);
        return next;
      });
      if (sync === 'pending') {
        feedback.showToast('Tersimpan di perangkat; akan disinkronkan saat online.', 'info');
      }
    } catch (err) {
      feedback.showAlert('Wishlist Gagal Diperbarui', err instanceof Error ? err.message : String(err));
    }
  };

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return places;
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.subCategoryLabel.toLowerCase().includes(q) ||
        (p.cuisine ?? '').toLowerCase().includes(q)
    );
  }, [places, searchQuery]);

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory: (c: ExploreCategory) => {
      if (c === selectedCategory) return;
      setLoading(true);
      setSelectedCategory(c);
    },
    radiusKm,
    places: filteredPlaces,
    wishlistedIds,
    loading,
    error,
    handleToggleWishlist,
    refreshPlaces: () => {
      setLoading(true);
      return loadPlaces();
    },
  };
}
