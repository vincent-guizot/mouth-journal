import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { PlaceCard } from '../components/PlaceCard';
import { theme } from '../config/theme';
import { Star, Coffee } from 'lucide-react-native';
import { useExploreScreen } from '../features/explore/hooks/useExploreScreen';
import { ExploreHeader } from '../features/explore/components/ExploreHeader';
import { ExploreSearchBar } from '../features/explore/components/ExploreSearchBar';
import { ExploreCategoryPills } from '../features/explore/components/ExploreCategoryPills';
import { ExplorePinPopup } from '../features/explore/components/ExplorePinPopup';
import { EmptyState } from '../components/feedback/EmptyState';
import { MapPin, SearchX } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface ExploreScreenProps {
  userLocation: UserLocation;
  userId: string;
  onPlaceSelect: (place: NearbyPlace) => void;
  onAddDiaryForPlace: (place: NearbyPlace) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  userLocation,
  userId,
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
    mapPins,
    selectedPin,
    setSelectedPin,
    wishlistedIds,
    loading,
    handleToggleWishlist,
  } = useExploreScreen({ userLocation, userId });

  const handlePinPress = (pin: (typeof mapPins)[0]) => {
    setSelectedPin(pin);
  };

  const handleSelectedPinNavigate = () => {
    if (!selectedPin) return;
    const place: NearbyPlace = {
      id: selectedPin.id,
      name: selectedPin.name,
      address: selectedPin.address,
      mainCategory: 'drinks',
      mainCategoryLabel: selectedPin.category,
      subCategory: 'cafe',
      subCategoryLabel: selectedPin.category,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      photoUrl: selectedPin.photoUrl,
      ratingAverage: selectedPin.rating,
    };
    onPlaceSelect(place);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Location & View Switcher */}
      <ExploreHeader
        userLocation={userLocation}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* 2. Search Bar */}
      <ExploreSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setSelectedCategory(selectedCategory === 'all' ? 'drinks' : 'all')}
      />

      {/* 3. Category Filter Chips */}
      <ExploreCategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Main Body: Map or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapCanvas}>
          {/* Stylized Map Background */}
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80',
            }}
            style={styles.mapBackgroundImage}
            resizeMode="cover"
          />
          <View style={styles.mapOverlay} />

          {/* Interactive Map Pins */}
          {mapPins.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            return (
              <TouchableOpacity
                key={pin.id}
                style={[
                  styles.mapPinContainer,
                  { top: pin.coords.top, left: pin.coords.left },
                ]}
                onPress={() => handlePinPress(pin)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.pinBubble,
                    isSelected && styles.pinBubbleSelected,
                  ]}
                >
                  <Coffee
                    size={13}
                    color={isSelected ? '#FFFFFF' : theme.colors.terracotta}
                  />
                  <Text
                    style={[
                      styles.pinBubbleText,
                      isSelected && styles.pinBubbleTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {pin.name}
                  </Text>
                  <View style={styles.pinRatingBadge}>
                    <Star size={9} color="#F39A28" fill="#F39A28" />
                    <Text style={styles.pinRatingText}>{pin.rating}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.pinArrow,
                    isSelected && styles.pinArrowSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          })}

          {/* Selected Pin Bottom Card */}
          {selectedPin && (
            <ExplorePinPopup
              pin={selectedPin}
              onPress={handleSelectedPinNavigate}
              isWishlisted={wishlistedIds.has(selectedPin.id)}
              onToggleWishlist={() => {
                const dummyPlace: NearbyPlace = {
                  id: selectedPin.id,
                  name: selectedPin.name,
                  address: selectedPin.address,
                  mainCategory: 'drinks',
                  mainCategoryLabel: selectedPin.category,
                  subCategory: 'cafe',
                  subCategoryLabel: selectedPin.category,
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  photoUrl: selectedPin.photoUrl,
                  ratingAverage: selectedPin.rating,
                };
                handleToggleWishlist(dummyPlace);
              }}
            />
          )}
        </View>
      ) : (
        /* List View */
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.terracotta} />
              <Text style={styles.loadingText}>Memuat rekomendasi tempat...</Text>
            </View>
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
                title="Belum Ada Tempat"
                subtitle="Jelajahi peta untuk menemukan tempat makan baru!"
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
  mapBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 250, 245, 0.45)',
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#EFE3D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBubbleSelected: {
    backgroundColor: '#3D2C1E',
    borderColor: '#3D2C1E',
  },
  pinBubbleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
    maxWidth: 90,
  },
  pinBubbleTextSelected: {
    color: '#FFFFFF',
  },
  pinRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    gap: 2,
  },
  pinRatingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
  pinArrowSelected: {
    borderTopColor: '#3D2C1E',
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
