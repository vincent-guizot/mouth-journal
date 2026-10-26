import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { WishlistCardItem } from '../mocks/data/mockWishlist';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';
import { WishlistHeader } from '../features/wishlist/components/WishlistHeader';
import { WishlistTabs } from '../features/wishlist/components/WishlistTabs';
import { WishlistSearchBar } from '../features/wishlist/components/WishlistSearchBar';
import { WishlistPlaceCard } from '../features/wishlist/components/WishlistPlaceCard';
import { WishlistMenuCard } from '../features/wishlist/components/WishlistMenuCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { Heart } from 'lucide-react-native';
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
    menuList,
    filteredPlaces,
    filteredMenus,
    handleToggleHeart,
    handleRemoveMenu,
  } = useWishlist(userId);

  const handleCardPress = (item: WishlistCardItem) => {
    const place: NearbyPlace = {
      id: item.id,
      name: item.name,
      address: item.address,
      mainCategory: item.mainCategory,
      mainCategoryLabel: item.categoryLabel,
      subCategory: item.subCategory,
      subCategoryLabel: item.categoryLabel,
      latitude: item.latitude,
      longitude: item.longitude,
      photoUrl: item.image,
      ratingAverage: item.rating,
      cuisine: item.description,
    };
    onPlaceSelect(place);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header: Wishlist Title & "Lihat di Peta" Button */}
      <WishlistHeader onOpenMap={onOpenMap} />

      {/* 2. Segmented Tabs: Tempat vs Menu */}
      <WishlistTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        placesCount={placesList.length}
        menuCount={menuList.length}
      />

      {/* 3. Search Bar + Filter + Sort */}
      <WishlistSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 4. List Content */}
      {activeTab === 'tempat' ? (
        filteredPlaces.length === 0 ? (
          <EmptyState
            icon={<Heart size={34} color={theme.colors.terracotta} />}
            title="Wishlist Masih Kosong"
            subtitle="Simpan tempat yang ingin kamu coba nanti."
          />
        ) : (
          <FlatList
            data={filteredPlaces}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <WishlistPlaceCard
                item={item}
                onPress={() => handleCardPress(item)}
                onToggleHeart={() => handleToggleHeart(item)}
              />
            )}
          />
        )
      ) : filteredMenus.length === 0 ? (
        <EmptyState
          icon={<Heart size={34} color={theme.colors.terracotta} />}
          title="Wishlist Menu Masih Kosong"
          subtitle="Simpan menu yang ingin kamu coba nanti."
        />
      ) : (
        <FlatList
          data={filteredMenus}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <WishlistMenuCard
              item={item}
              onRemoveHeart={() => handleRemoveMenu(item)}
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
