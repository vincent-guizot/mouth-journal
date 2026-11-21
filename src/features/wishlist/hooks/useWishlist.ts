import { useCallback, useEffect, useMemo, useState } from 'react';
import { WishlistItem } from '../../../models/wishlist';
import { UserLocation } from '../../../models/place';
import { wishlistRepository } from '../../../repositories';
import { calculateDistance } from '../../../utils/geo';
import { feedback } from '../../../components/feedback';

export type WishlistTab = 'tempat' | 'menu';
export type WishlistSort = 'newest' | 'name_asc' | 'name_desc' | 'nearest';

const SORT_CYCLE: WishlistSort[] = ['newest', 'nearest', 'name_asc', 'name_desc'];

/** Real wishlist from the repository (no mock rows, no invented ratings). */
export function useWishlist(userId: string, userLocation?: UserLocation) {
  const [activeTab, setActiveTab] = useState<WishlistTab>('tempat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placesList, setPlacesList] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<WishlistSort>('newest');

  const fetchList = useCallback(
    () =>
      wishlistRepository.getWishlist(userId).then(
        (items) => ({ items, error: null as string | null }),
        (err) => ({ items: null, error: err instanceof Error ? err.message : String(err) })
      ),
    [userId]
  );

  const apply = useCallback((r: { items: WishlistItem[] | null; error: string | null }) => {
    if (r.items) setPlacesList(r.items);
    setError(r.error);
    setLoading(false);
  }, []);

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

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    placesList,
    filteredPlaces,
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
  };
}
