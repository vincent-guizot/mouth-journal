import { Journal, JournalDraft } from '../../models/journal';
import { MutationResult, SyncState } from '../sync/types';

export interface IJournalRepository {
  /** Journals owned by userId (validated, ownership-checked, pending changes applied). */
  getJournals(userId: string): Promise<Journal[]>;
  /** null when the journal does not exist for this user. */
  getJournalById(userId: string, journalId: string): Promise<Journal | null>;
  /** id/userId/createdAt are assigned by the repository, never by the caller. */
  createJournal(userId: string, draft: JournalDraft): Promise<MutationResult<Journal>>;
  /** id/userId/createdAt are immutable; updatedAt is set by the repository. */
  updateJournal(userId: string, journalId: string, updates: Partial<JournalDraft>): Promise<MutationResult<Journal>>;
  deleteJournal(userId: string, journalId: string): Promise<MutationResult<{ id: string }>>;
  getSyncState(userId: string): Promise<SyncState>;
  syncPending(userId: string): Promise<SyncState>;
  retryFailed(userId: string): Promise<SyncState>;
  clearUserCache(userId: string): Promise<void>;
}
