import { useState, useEffect, useCallback, useMemo } from 'react';
import { DiaryEntry } from '../../../types/diary';
import { journalRepository } from '../../../repositories';
import { SyncState } from '../../../repositories/sync/types';
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
  const [error, setError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({ pending: 0, failed: [] });

  const fetchData = useCallback(async () => {
    let data: DiaryEntry[] | null = null;
    let err: string | null = null;
    let sync: SyncState | null = null;
    try {
      data = await journalRepository.getJournals(userId);
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    try {
      sync = await journalRepository.getSyncState(userId);
    } catch (e) {
      err = err ?? (e instanceof Error ? e.message : String(e));
    }
    return { data, err, sync };
  }, [userId]);

  const apply = useCallback((r: { data: DiaryEntry[] | null; err: string | null; sync: SyncState | null }) => {
    if (r.data) setDiaries(r.data);
    if (r.sync) setSyncState(r.sync);
    setError(r.err);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchData().then((r) => active && apply(r));
    return () => {
      active = false;
    };
  }, [fetchData, apply]);

  const loadData = useCallback(() => fetchData().then(apply), [fetchData, apply]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredDiaries = useMemo(
    () => filterDiaryEntries(diaries, activeSegment, selectedCategory, searchQuery),
    [diaries, activeSegment, selectedCategory, searchQuery]
  );

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
    error,
    syncState,
  };
}
