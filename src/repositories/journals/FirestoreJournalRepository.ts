import { Journal, JournalDraft } from '../../models/journal';
import { computeOverallRating, journalSchemaFor } from '../../schemas/journalSchema';
import { generateId } from '../../utils/ids';
import { OfflineCollection } from '../sync/OfflineCollection';
import { MutationResult, RepositoryDeps, SyncState } from '../sync/types';
import { IJournalRepository } from './IJournalRepository';

export class JournalNotFoundError extends Error {
  readonly code = 'app/journal-not-found';
  constructor(journalId: string) {
    super(`Jurnal ${journalId} tidak ditemukan.`);
    this.name = 'JournalNotFoundError';
  }
}

/** Fields that the caller may never set or change. */
const stripOwnedFields = <T extends object>(input: T) => {
  const { id: _id, userId: _u, createdAt: _c, updatedAt: _up, ...rest } = input as T & Partial<Journal>;
  return rest;
};

/**
 * Journals live at /users/{uid}/journals/{journalId}. Offline-first via
 * OfflineCollection (cache → queue → Firestore).
 */
export class FirestoreJournalRepository implements IJournalRepository {
  private readonly store: OfflineCollection<Journal>;

  constructor(private readonly deps: RepositoryDeps) {
    this.store = new OfflineCollection<Journal>(deps, {
      name: 'journals',
      path: (uid) => ['users', uid, 'journals'],
      // Device-local photo URIs are only legal in explicit demo mode.
      schema: journalSchemaFor(deps.mode === 'demo'),
      orderByField: 'createdAt',
    });
  }

  private get schema() {
    return journalSchemaFor(this.deps.mode === 'demo');
  }

  getJournals(userId: string): Promise<Journal[]> {
    return this.store.list(userId);
  }

  getJournalById(userId: string, journalId: string): Promise<Journal | null> {
    return this.store.get(userId, journalId);
  }

  async createJournal(userId: string, draft: JournalDraft): Promise<MutationResult<Journal>> {
    this.store.assertUsable(userId);
    const now = this.store.now().toISOString();
    const journal = this.schema.parse({
      ...stripOwnedFields(draft),
      overallRating: computeOverallRating(draft.criteriaRating),
      id: generateId(),
      userId,
      createdAt: now,
    });
    const sync = await this.store.mutate(userId, { kind: 'upsert', data: journal });
    return { data: journal, sync };
  }

  async updateJournal(
    userId: string,
    journalId: string,
    updates: Partial<JournalDraft>
  ): Promise<MutationResult<Journal>> {
    this.store.assertUsable(userId);
    const existing = await this.store.get(userId, journalId);
    if (!existing) throw new JournalNotFoundError(journalId);
    const merged = { ...existing, ...stripOwnedFields(updates) };
    const journal = this.schema.parse({
      ...merged,
      overallRating: computeOverallRating(merged.criteriaRating),
      id: existing.id,
      userId: existing.userId,
      createdAt: existing.createdAt,
      updatedAt: this.store.now().toISOString(),
    });
    const sync = await this.store.mutate(userId, { kind: 'upsert', data: journal });
    return { data: journal, sync };
  }

  async deleteJournal(userId: string, journalId: string): Promise<MutationResult<{ id: string }>> {
    this.store.assertUsable(userId);
    if (!journalId) throw new Error('Journal ID wajib diisi.');
    const sync = await this.store.mutate(userId, { kind: 'delete', docId: journalId });
    return { data: { id: journalId }, sync };
  }

  getSyncState(userId: string): Promise<SyncState> {
    return this.store.getSyncState(userId);
  }

  syncPending(userId: string): Promise<SyncState> {
    return this.store.flush(userId);
  }

  retryFailed(userId: string): Promise<SyncState> {
    return this.store.retryFailed(userId);
  }

  clearUserCache(userId: string): Promise<void> {
    return this.store.clear(userId);
  }
}
