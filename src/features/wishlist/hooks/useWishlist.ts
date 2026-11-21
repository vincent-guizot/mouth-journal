import { useCallback, useEffect, useMemo, useState } from 'react';
import { WishlistItem } from '../../../models/wishlist';
import { MenuWishlistItem, MenuWishlistAddInput } from '../../../models/menuWishlist';
import { UserLocation } from '../../../models/place';
import { wishlistRepository, menuWishlistRepository } from '../../../repositories';
import { calculateDistance } from '../../../utils/geo';
import { feedback } from '../../../components/feedback';

export type WishlistTab = 'tempat' | 'menu';
export type WishlistSort = 'newest' | 'name_asc' | 'name_desc' | 'nearest';

const SORT_CYCLE: WishlistSort[] = ['newest', 'nearest', 'name_asc', 'name_desc'];

/** Real wishlist for places and menu items from offline-capable repositories. */
export function useWishlist(userId: string, userLocation?: UserLocation) {
  const [activeTab, setActiveTab] = useState<WishlistTab>('tempat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placesList, setPlacesList] = useState<WishlistItem[]>([]);
  const [menuList, setMenuList] = useState<MenuWishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<WishlistSort>('newest');

  const fetchList = useCallback(
    () =>
      Promise.all([
        wishlistRepository.getWishlist(userId),
        menuWishlistRepository.getMenuWishlist(userId),
      ]).then(
        ([places, menus]) => ({ places, menus, error: null as string | null }),
        (err) => ({ places: null, menus: null, error: err instanceof Error ? err.message : String(err) })
      ),
    [userId]
  );

  const apply = useCallback(
    (r: { places: WishlistItem[] | null; menus: MenuWishlistItem[] | null; error: string | null }) => {
      if (r.places) setPlacesList(r.places);
      if (r.menus) setMenuList(r.menus);
      setError(r.error);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    let active = true;
    fetchList().then((r) => active && apply(r));
    return () => {
      active = false;
    };
  }, [fetchList, apply]);

  const load = useCallback(() => fetchList().then(apply), [fetchList, apply]);

  const distanceOf = useCallback(
    (item: WishlistItem) =>
      userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude) : undefined,
    [userLocation]
  );

  const handleToggleHeart = (item: WishlistItem) => {
    feedback.showConfirm({
      title: 'Wishlist',
      message: `Hapus "${item.placeName}" dari Wishlist?`,
      cancelText: 'Batal',
      confirmText: 'Hapus',
      destructive: true,
      onConfirm: async () => {
        try {
          const { sync } = await wishlistRepository.removeFromWishlist(userId, item.placeId);
          setPlacesList((prev) => prev.filter((p) => p.placeId !== item.placeId));
          if (sync === 'pending') {
            feedback.showToast('Dihapus di perangkat; akan disinkronkan saat online.', 'info');
          }
        } catch (err) {
          feedback.showAlert('Gagal Menghapus', err instanceof Error ? err.message : String(err));
        }
      },
    });
  };

  const handleAddMenu = async (input: MenuWishlistAddInput) => {
    const { data, sync } = await menuWishlistRepository.addMenuWishlist(userId, input);
    setMenuList((prev) => [data, ...prev.filter((m) => m.id !== data.id)]);
    if (sync === 'pending') {
      feedback.showToast('Disimpan di perangkat; akan disinkronkan saat online.', 'info');
    } else {
      feedback.showToast(`Menu "${data.menuName}" berhasil ditambahkan ke wishlist!`, 'success');
    }
  };

  const handleRemoveMenu = (item: MenuWishlistItem) => {
    feedback.showConfirm({
      title: 'Wishlist Menu',
      message: `Hapus menu "${item.menuName}" dari Wishlist?`,
      cancelText: 'Batal',
      confirmText: 'Hapus',
      destructive: true,
      onConfirm: async () => {
        try {
          const { sync } = await menuWishlistRepository.removeMenuWishlist(userId, item.id);
          setMenuList((prev) => prev.filter((m) => m.id !== item.id));
          if (sync === 'pending') {
            feedback.showToast('Dihapus di perangkat; akan disinkronkan saat online.', 'info');
          }
        } catch (err) {
          feedback.showAlert('Gagal Menghapus', err instanceof Error ? err.message : String(err));
        }
      },
    });
  };

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = placesList.filter(
      (item) =>
        !q ||
        item.placeName.toLowerCase().includes(q) ||
        item.placeAddress.toLowerCase().includes(q) ||
        (item.personalNotes ?? '').toLowerCase().includes(q)
    );
    const sorted = [...result];
    if (sort === 'name_asc') sorted.sort((a, b) => a.placeName.localeCompare(b.placeName));
    else if (sort === 'name_desc') sorted.sort((a, b) => b.placeName.localeCompare(a.placeName));
    else if (sort === 'nearest' && userLocation) sorted.sort((a, b) => (distanceOf(a) ?? 0) - (distanceOf(b) ?? 0));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [placesList, searchQuery, sort, userLocation, distanceOf]);

  const filteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = menuList.filter(
      (item) =>
        !q ||
        item.menuName.toLowerCase().includes(q) ||
        item.placeName.toLowerCase().includes(q) ||
        (item.notes ?? '').toLowerCase().includes(q)
    );
    const sorted = [...result];
    if (sort === 'name_asc') sorted.sort((a, b) => a.menuName.localeCompare(b.menuName));
    else if (sort === 'name_desc') sorted.sort((a, b) => b.menuName.localeCompare(a.menuName));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [menuList, searchQuery, sort]);

  return {
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
    reload: () => {
      setLoading(true);
      return load();
    },
    sort,
    cycleSort: () => setSort((s) => SORT_CYCLE[(SORT_CYCLE.indexOf(s) + 1) % SORT_CYCLE.length]),
    distanceOf,
    handleToggleHeart,
    handleAddMenu,
    handleRemoveMenu,
  };
}
