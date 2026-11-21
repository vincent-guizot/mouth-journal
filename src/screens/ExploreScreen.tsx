import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { PlaceCard } from '../components/PlaceCard';
import { theme } from '../config/theme';
import { useExploreScreen } from '../features/explore/hooks/useExploreScreen';
import { ExploreHeader } from '../features/explore/components/ExploreHeader';
import { ExploreSearchBar } from '../features/explore/components/ExploreSearchBar';
import { ExploreCategoryPills } from '../features/explore/components/ExploreCategoryPills';
import { ExplorePinPopup } from '../features/explore/components/ExplorePinPopup';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { MapPin, SearchX } from 'lucide-react-native';
import { MapViewComponent } from '../components/MapViewComponent';

export interface ExploreScreenProps {
  userLocation: UserLocation;
  userId: string;
  onRefreshLocation: () => Promise<void>;
  isRefreshingLocation: boolean;
  onPlaceSelect: (place: NearbyPlace) => void;
  onAddDiaryForPlace: (place: NearbyPlace) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  userLocation,
  userId,
  onRefreshLocation,
  isRefreshingLocation,
  onPlaceSelect,
  onAddDiaryForPlace,
}) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    places,
    wishlistedIds,
    loading,
    error,
    refreshPlaces,
    handleToggleWishlist,
  } = useExploreScreen({ userLocation, userId });
  const [selectedMapPlace, setSelectedMapPlace] = useState<NearbyPlace | null>(null);

  const handleSelectedPinNavigate = () => {
    if (selectedMapPlace) onPlaceSelect(selectedMapPlace);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Location & View Switcher */}
      <ExploreHeader
        userLocation={userLocation}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onRefreshLocation={onRefreshLocation}
        isRefreshingLocation={isRefreshingLocation}
      />

      {/* 2. Category Filter Chips - Di atas Search */}
      <ExploreCategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Search Bar - Di bawah Kategori */}
      <ExploreSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 4. Main Body: Map or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapCanvas}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.terracotta} />
              <Text style={styles.loadingText}>Mencari tempat di sekitarmu...</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={refreshPlaces} />
          ) : (
            <MapViewComponent
              userLocation={userLocation}
              places={places}
              selectedPlaceId={selectedMapPlace?.id}
              onPlaceSelect={setSelectedMapPlace}
              style={styles.interactiveMap}
            />
          )}

          {selectedMapPlace && (
            <ExplorePinPopup
              place={selectedMapPlace}
              onPress={handleSelectedPinNavigate}
              isWishlisted={wishlistedIds.has(selectedMapPlace.id)}
              onToggleWishlist={() => handleToggleWishlist(selectedMapPlace)}
            />
          )}
        </View>
      ) : (
        /* List View */
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.terracotta} />
              <Text style={styles.loadingText}>Memuat tempat dari OpenStreetMap...</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={refreshPlaces} />
          ) : places.length === 0 ? (
            searchQuery.trim().length > 0 ? (
              <EmptyState
                icon={<SearchX size={34} color={theme.colors.terracotta} />}
                title="Tidak Ada Hasil"
                subtitle="Coba kata kunci lain yang lebih spesifik."
              />
            ) : (
              <EmptyState
                icon={<MapPin size={34} color={theme.colors.terracotta} />}
                title="Tidak Ada Tempat di Sekitar"
                subtitle="OpenStreetMap tidak mengembalikan tempat untuk kategori dan radius ini."
              />
            )
          ) : (
            <FlatList
              data={places}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <PlaceCard
                  place={item}
                  onPress={() => onPlaceSelect(item)}
                  isWishlisted={wishlistedIds.has(item.id)}
                  onWishlistToggle={() => handleToggleWishlist(item)}
                />
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  interactiveMap: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
