import { useState, useEffect, useMemo } from 'react';
import { DiaryEntry } from '../../../types/diary';
import { UserProfile } from '../../../services/firebase/authService';
import { DiaryService } from '../../../services/firebase/diaryService';
import { MOCK_JOURNALS } from '../../../mocks/data/mockJournals';

export type ProfileTab = 'jurnal' | 'tempat' | 'menu' | 'wishlist';

export function useProfileScreen(user: UserProfile) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('jurnal');
  const [userDiaries, setUserDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDiaries() {
      try {
        setLoading(true);
        const loaded = await DiaryService.getMyDiaries(user.uid);
        if (!isMounted) return;

        if (loaded && loaded.length > 0) {
          setUserDiaries(loaded as unknown as DiaryEntry[]);
        } else {
          setUserDiaries(MOCK_JOURNALS as unknown as DiaryEntry[]);
        }
      } catch {
        if (isMounted) {
          setUserDiaries(MOCK_JOURNALS as unknown as DiaryEntry[]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDiaries();

    return () => {
      isMounted = false;
    };
  }, [user.uid]);

  const stats = useMemo(() => {
    return DiaryService.calculateStats(userDiaries as any);
  }, [userDiaries]);

  return {
    activeTab,
    setActiveTab,
    userDiaries,
    stats,
    loading,
  };
}
