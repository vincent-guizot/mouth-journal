import { useCallback, useEffect, useState } from 'react';
import { Journal } from '../../../models/journal';
import { journalRepository } from '../../../repositories';

export type RecordStatus = 'loading' | 'ready' | 'not_found' | 'invalid' | 'error';

type Outcome = { journal: Journal | null; status: RecordStatus; error: string | null };

/** Loads one journal of the signed-in user; validated initial data only paints first. */
export function useJournalRecord(userId: string | undefined, journalId: string | null, initial: Journal | null) {
  const [state, setState] = useState<Outcome>({
    journal: initial,
    status: journalId ? (initial ? 'ready' : 'loading') : 'invalid',
    error: null,
  });

  const fetchRecord = useCallback(async (): Promise<Outcome | null> => {
    if (!journalId || !userId) return null;
    try {
      const fetched = await journalRepository.getJournalById(userId, journalId);
      return { journal: fetched, status: fetched ? 'ready' : 'not_found', error: null };
    } catch (err) {
      return { journal: null, status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  }, [userId, journalId]);

  const apply = useCallback((o: Outcome | null) => {
    if (!o) return;
    // Keep showing an already-loaded journal if only the refresh failed.
    setState((prev) => (o.status === 'error' && prev.status === 'ready' ? { ...prev, error: o.error } : o));
  }, []);

  useEffect(() => {
    let active = true;
    fetchRecord().then((o) => active && apply(o));
    return () => {
      active = false;
    };
  }, [fetchRecord, apply]);

  const reload = useCallback(() => fetchRecord().then(apply), [fetchRecord, apply]);
  return { ...state, reload };
}
