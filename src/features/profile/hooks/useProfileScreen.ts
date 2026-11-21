import { useState, useEffect, useMemo, useCallback } from 'react';
import { DiaryEntry } from '../../../types/diary';
import { UserProfile } from '../../../models/user';
import { WishlistItem } from '../../../models/wishlist';
import { journalRepository, wishlistRepository } from '../../../repositories';
import { DiaryService } from '../../../services/firebase/diaryService';
import {
  aggregateVisitedPlaces,
  aggregateLoggedDishes,
} from '../profileAggregation';

export type ProfileTab = 'jurnal' | 'tempat' | 'menu' | 'wishlist';

export function useProfileScreen(user: UserProfile) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('jurnal');
  const [userDiaries, setUserDiaries] = useState<DiaryEntry[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    (isMounted: () => boolean) => {
      Promise.all([
        journalRepository.getJournals(user.uid),
        wishlistRepository.getWishlist(user.uid),
      ])
        .then(([loadedDiaries, loadedWishlist]) => {
          if (!isMounted()) return;
          setUserDiaries(loadedDiaries);
          setWishlistItems(loadedWishlist);
          setError(null);
        })
        .catch((err) => {
          if (isMounted()) {
            setError(err instanceof Error ? err.message : String(err));
          }
        })
        .finally(() => {
          if (isMounted()) {
            setLoading(false);
          }
        });
    },
    [user.uid]
  );

  useEffect(() => {
    let mounted = true;
    fetchData(() => mounted);
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const reload = useCallback(() => {
    setLoading(true);
    fetchData(() => true);
  }, [fetchData]);

  const stats = useMemo(() => DiaryService.calculateStats(userDiaries), [userDiaries]);
  const visitedPlaces = useMemo(() => aggregateVisitedPlaces(userDiaries), [userDiaries]);
  const dishes = useMemo(() => aggregateLoggedDishes(userDiaries), [userDiaries]);

  return {
    activeTab,
    setActiveTab,
    userDiaries,
    visitedPlaces,
    dishes,
    wishlistItems,
    stats,
    loading,
    error,
    reload,
  };
}
