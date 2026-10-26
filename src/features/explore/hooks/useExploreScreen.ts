import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NearbyPlace, UserLocation } from '../../../types/places';
import { placesService } from '../../../services/places/placesService';
import { DiaryService } from '../../../services/firebase/diaryService';
import { MOCK_MAP_PINS, MapPinData } from '../../../mocks/data/mockMapPins';

export interface UseExploreScreenProps {
  userLocation: UserLocation;
  userId: string;
}

export function useExploreScreen({ userLocation, userId }: UseExploreScreenProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'terdekat' | 'rating' | 'terbaru'>('terdekat');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(MOCK_MAP_PINS[0]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const loadPlaces = useCallback(async () => {
    try {
      setLoading(true);
      const results = await placesService.searchNearby(
        userLocation.latitude,
        userLocation.longitude,
        5000,
        selectedCategory as any
      );
      setPlaces(results);
    } catch (err) {
      console.warn('[useExploreScreen] Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation.latitude, userLocation.longitude, selectedCategory]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handleToggleWishlist = async (place: NearbyPlace) => {
    const isSaved = wishlistedIds.has(place.id);
    if (isSaved) {
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(place.id);
        return next;
      });
      Alert.alert('Wishlist', `"${place.name}" dihapus dari Wishlist.`);
    } else {
      setWishlistedIds((prev) => new Set(prev).add(place.id));
      try {
        await DiaryService.addToWishlist(userId, {
          userId,
          placeName: place.name,
          address: place.address || '',
          mainCategory: place.mainCategory,
          subCategory: place.subCategory,
          subCategoryLabel: place.subCategoryLabel || place.subCategory,
          latitude: place.latitude,
          longitude: place.longitude,
          notes: 'Disimpan dari Explore Map',
        });
        Alert.alert('Wishlist', `"${place.name}" ditambahkan ke Wishlist.`);
      } catch {
        // Fallback
      }
    }
  };

  const filteredPlaces = useMemo(() => {
    let result = [...places];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          p.subCategory.toLowerCase().includes(q)
      );
    }

    if (selectedSort === 'rating') {
      result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
    } else if (selectedSort === 'terdekat') {
      result.sort((a, b) => (a.distanceMeter || 0) - (b.distanceMeter || 0));
    }

    return result;
  }, [places, searchQuery, selectedSort]);

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    places: filteredPlaces,
    mapPins: MOCK_MAP_PINS,
    selectedPin,
    setSelectedPin,
    wishlistedIds,
    loading,
    handleToggleWishlist,
    refreshPlaces: loadPlaces,
  };
}
