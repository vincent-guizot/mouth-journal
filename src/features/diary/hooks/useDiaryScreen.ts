import { useState, useEffect, useCallback, useMemo } from 'react';
import { DiaryEntry } from '../../../types/diary';
import { DiaryService } from '../../../services/firebase/diaryService';
import { DiarySegment } from '../constants/diaryConstants';
import { filterDiaryEntries } from '../helpers/diaryFilters';

export interface UseDiaryScreenOptions {
  userId: string;
}

export function useDiaryScreen({ userId }: UseDiaryScreenOptions) {
  const [activeSegment, setActiveSegment] = useState<DiarySegment>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await DiaryService.getMyDiaries(userId);
      setDiaries(data as unknown as DiaryEntry[]);
    } catch (error) {
      console.warn('[useDiaryScreen] Error loading diaries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredDiaries = useMemo(() => {
    return filterDiaryEntries(diaries, activeSegment, selectedCategory, searchQuery);
  }, [diaries, activeSegment, selectedCategory, searchQuery]);

  return {
    activeSegment,
    setActiveSegment,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    diaries,
    filteredDiaries,
    loading,
    refreshing,
    onRefresh,
    loadData,
  };
}
