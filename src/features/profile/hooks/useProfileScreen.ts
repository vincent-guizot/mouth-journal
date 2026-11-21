import { useState, useEffect, useMemo } from 'react';
import { DiaryEntry } from '../../../types/diary';
import { UserProfile } from '../../../models/user';
import { journalRepository } from '../../../repositories';
import { DiaryService } from '../../../services/firebase/diaryService';

export type ProfileTab = 'jurnal' | 'tempat' | 'menu' | 'wishlist';

export function useProfileScreen(user: UserProfile) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('jurnal');
  const [userDiaries, setUserDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    journalRepository
      .getJournals(user.uid)
      .then((loaded) => {
        if (!isMounted) return;
        setUserDiaries(loaded);
        setError(null);
      })
      .catch((err) => isMounted && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [user.uid]);

  const stats = useMemo(() => DiaryService.calculateStats(userDiaries), [userDiaries]);

  return { activeTab, setActiveTab, userDiaries, stats, loading, error };
}
