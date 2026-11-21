import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';
import { wishlistItemToPlace } from '../features/wishlist/wishlistToPlace';
import { WishlistHeader } from '../features/wishlist/components/WishlistHeader';
import { WishlistTabs } from '../features/wishlist/components/WishlistTabs';
import { WishlistSearchBar } from '../features/wishlist/components/WishlistSearchBar';
import { WishlistPlaceCard } from '../features/wishlist/components/WishlistPlaceCard';
import { WishlistMenuCard } from '../features/wishlist/components/WishlistMenuCard';
import { AddMenuWishlistModal } from '../features/wishlist/components/AddMenuWishlistModal';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { DecorativeAssets } from '../config/assets';
import { Heart, Plus, UtensilsCrossed } from 'lucide-react-native';
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
  const [addMenuModalVisible, setAddMenuModalVisible] = useState(false);
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    placesList,
    filteredPlaces,
    menuList,
    filteredMenu,
    loading,
    error,
    reload,
    cycleSort,
    distanceOf,
    handleToggleHeart,
    handleAddMenu,
    handleRemoveMenu,
  } = useWishlist(userId, userLocation.source === 'gps' ? userLocation : undefined);

  return (
    <View style={styles.container}>
      <WishlistHeader onOpenMap={onOpenMap} />

      <WishlistTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        placesCount={placesList.length}
        menuCount={menuList.length}
      />

      <WishlistSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSortPress={cycleSort} />

      {activeTab === 'menu' && (
        <View style={styles.addMenuRow}>
          <TouchableOpacity
            style={styles.addMenuButton}
            onPress={() => setAddMenuModalVisible(true)}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addMenuButtonText}>Tambah Menu Incaran</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : activeTab === 'menu' ? (
        loading && menuList.length === 0 ? (
          <LoadingState message="Memuat wishlist menu..." />
        ) : filteredMenu.length === 0 ? (
          <EmptyState
            illustration={DecorativeAssets.iconFoodCloche}
            icon={<UtensilsCrossed size={34} color={theme.colors.terracotta} />}
            title={searchQuery ? 'Tidak Ada Menu Cocok' : 'Wishlist Menu Masih Kosong'}
            subtitle={
              searchQuery
                ? 'Coba kata kunci menu atau tempat lain.'
                : 'Simpan menu incaranmu beserta estimasi harganya agar tidak lupa saat berkunjung.'
            }
            action={
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setAddMenuModalVisible(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Tambah Menu Sekarang</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <FlatList
            data={filteredMenu}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
            renderItem={({ item }) => (
              <WishlistMenuCard
                item={item}
                onRemoveHeart={() => handleRemoveMenu(item)}
              />
            )}
          />
        )
      ) : loading && placesList.length === 0 ? (
        <LoadingState message="Memuat wishlist tempat..." />
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          illustration={DecorativeAssets.flourishHeartRadiant}
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

      <AddMenuWishlistModal
        visible={addMenuModalVisible}
        onClose={() => setAddMenuModalVisible(false)}
        onAdd={handleAddMenu}
        placesList={placesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addMenuRow: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  addMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E2E21',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  addMenuButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D04A1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 40,
  },
});
