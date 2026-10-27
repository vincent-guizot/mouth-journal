import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  MOCK_WISHLIST_PLACES,
  MOCK_WISHLIST_MENUS,
  WishlistCardItem,
  WishlistMenuItem,
} from '../../../mocks/data/mockWishlist';

export type WishlistTab = 'tempat' | 'menu';

export function useWishlist(userId: string) {
  const [activeTab, setActiveTab] = useState<WishlistTab>('tempat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placesList, setPlacesList] = useState<WishlistCardItem[]>(MOCK_WISHLIST_PLACES);
  const [menuList, setMenuList] = useState<WishlistMenuItem[]>(MOCK_WISHLIST_MENUS);
  const [loading, setLoading] = useState<boolean>(false);
  const [minimumRating, setMinimumRating] = useState<number | null>(null);
  const [sortAscending, setSortAscending] = useState(false);

  const handleToggleHeart = (item: WishlistCardItem) => {
    Alert.alert('Wishlist', `Hapus "${item.name}" dari Wishlist?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setPlacesList((prev) => prev.filter((p) => p.id !== item.id));
        },
      },
    ]);
  };

  const handleRemoveMenu = (item: WishlistMenuItem) => {
    Alert.alert('Wishlist', `Hapus "${item.name}" dari Wishlist?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setMenuList((prev) => prev.filter((m) => m.id !== item.id));
        },
      },
    ]);
  };

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = placesList.filter(
      (item) =>
        (!q || item.name.toLowerCase().includes(q) || item.address.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) &&
        minimumRating === null
    );
    return result.sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  }, [placesList, searchQuery, minimumRating, sortAscending]);

  const filteredMenus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = menuList.filter(
      (item) =>
        (!q || item.name.toLowerCase().includes(q) || item.placeName.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q)) &&
        (minimumRating === null || Number(item.price.replace(/[^0-9]/g, '')) >= 50000)
    );
    return result.sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [menuList, searchQuery, minimumRating, sortAscending]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    placesList,
    menuList,
    filteredPlaces,
    filteredMenus,
    loading,
    minimumRating,
    setMinimumRating,
    sortAscending,
    setSortAscending,
    handleToggleHeart,
    handleRemoveMenu,
  };
}
