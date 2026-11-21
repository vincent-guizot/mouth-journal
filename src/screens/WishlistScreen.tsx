import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';
import { wishlistItemToPlace } from '../features/wishlist/wishlistToPlace';
import { WishlistHeader } from '../features/wishlist/components/WishlistHeader';
import { WishlistTabs } from '../features/wishlist/components/WishlistTabs';
import { WishlistSearchBar } from '../features/wishlist/components/WishlistSearchBar';
import { WishlistPlaceCard } from '../features/wishlist/components/WishlistPlaceCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { Heart, UtensilsCrossed } from 'lucide-react-native';
import { theme } from '../config/theme';

export interface WishlistScreenProps {
  userId: string;
  userLocation: UserLocation;
  onPlaceSelect: (place: NearbyPlace) => void;
  onOpenMap: () => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  userId,
  userLocation,
  onPlaceSelect,
  onOpenMap,
}) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    placesList,
    filteredPlaces,
    loading,
    error,
    reload,
    cycleSort,
    distanceOf,
    handleToggleHeart,
  } = useWishlist(userId, userLocation.source === 'gps' ? userLocation : undefined);

  return (
    <View style={styles.container}>
      <WishlistHeader onOpenMap={onOpenMap} />

      {/* Menu wishlist has no data model/backend yet, so its count is honestly 0. */}
      <WishlistTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        placesCount={placesList.length}
        menuCount={0}
      />

      <WishlistSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSortPress={cycleSort} />

      {activeTab === 'menu' ? (
        <EmptyState
          icon={<UtensilsCrossed size={34} color={theme.colors.terracotta} />}
          title="Wishlist Menu Belum Tersedia"
          subtitle="Saat ini hanya tempat yang dapat disimpan ke wishlist."
        />
      ) : loading && placesList.length === 0 ? (
        <LoadingState message="Memuat wishlist..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          icon={<Heart size={34} color={theme.colors.terracotta} />}
          title={searchQuery ? 'Tidak Ada Hasil' : 'Wishlist Masih Kosong'}
          subtitle={searchQuery ? 'Coba kata kunci lain.' : 'Simpan tempat dari Explore yang ingin kamu coba nanti.'}
        />
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.placeId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
          renderItem={({ item }) => (
            <WishlistPlaceCard
              item={item}
              distanceMeter={distanceOf(item)}
              onPress={() => onPlaceSelect(wishlistItemToPlace(item))}
              onToggleHeart={() => handleToggleHeart(item)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 40,
  },
});
