import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type { ZodType } from 'zod';
import { userKeyPrefix } from '../../storage/keyValueStore';
import {
  BackendNotConfiguredError,
  DEFAULT_REMOTE_TIMEOUT_MS,
  describeError,
  isTransientRemoteError,
  OfflineSnapshotError,
  stripUndefined,
  withTimeout,
} from './remote';
import type { PendingOperationInfo, RepositoryDeps, SyncState, SyncStatus } from './types';

interface QueuedOp<T> {
  kind: 'upsert' | 'delete';
  docId: string;
  data?: T;
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
  failed: boolean;
}

export interface OfflineCollectionConfig<T> {
  /** Cache key suffix, e.g. 'journals'. */
  name: string;
  /** Firestore collection path segments for a user, e.g. ['users', uid, 'journals']. */
  path: (userId: string) => [string, ...string[]];
  schema: ZodType<T>;
  /** Firestore orderBy field + matching local comparator (desc). */
  orderByField: keyof T & string;
}

export class CorruptRemoteDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorruptRemoteDataError';
  }
}

/**
 * Offline-first, per-user collection:
 *  - cache key and queue key are namespaced by userId;
 *  - every value read from cache or Firestore is validated with the schema and must
 *    belong to the requesting user;
 *  - mutations are applied to the cache first, then flushed to Firestore through a
 *    persistent queue (survives restarts). Transient failures stay queued; permanent
 *    failures roll the optimistic change back and are rethrown to the caller.
 */
export class OfflineCollection<T extends { id: string; userId: string }> {
  private locks = new Map<string, Promise<unknown>>();

  constructor(
    private readonly deps: RepositoryDeps,
    private readonly cfg: OfflineCollectionConfig<T>
  ) {}

  get isLocalOnly(): boolean {
    return this.deps.mode === 'demo';
  }

  private get timeoutMs() {
    return this.deps.remoteTimeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS;
  }

  now(): Date {
    return this.deps.now ? this.deps.now() : new Date();
  }

  assertUsable(userId: string) {
    if (!userId) throw new Error('User ID wajib diisi.');
    if (this.deps.mode === 'unconfigured') throw new BackendNotConfiguredError();
    if (this.deps.mode === 'firebase' && !this.deps.db) throw new BackendNotConfiguredError();
  }

  private cacheKey(userId: string) {
    return `${userKeyPrefix(userId)}${this.cfg.name}`;
  }

  private queueKey(userId: string) {
    return `${userKeyPrefix(userId)}${this.cfg.name}_queue`;
  }

  /** Serialise all cache/queue read-modify-write cycles per user. */
  private exclusive<R>(userId: string, fn: () => Promise<R>): Promise<R> {
    const prev = this.locks.get(userId) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    this.locks.set(
      userId,
      next.catch(() => undefined)
    );
    return next;
  }

  private sort(items: T[]): T[] {
    const field = this.cfg.orderByField;
    return [...items].sort((a, b) => String(b[field]).localeCompare(String(a[field])));
  }

  private validateOwned(raw: unknown, userId: string): T | null {
    const parsed = this.cfg.schema.safeParse(raw);
    if (!parsed.success) return null;
    return parsed.data.userId === userId ? parsed.data : null;
  }

  // ---------------------------------------------------------------- cache

  async readCache(userId: string): Promise<T[]> {
    const raw = await this.deps.kv.getItem(this.cacheKey(userId));
    if (raw === null) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn(`[${this.cfg.name}] Cache rusak (JSON tidak valid) untuk user ${userId}; cache dibuang.`);
      await this.deps.kv.removeItem(this.cacheKey(userId));
      return [];
    }
    if (!Array.isArray(parsed)) {
      console.warn(`[${this.cfg.name}] Cache bukan array untuk user ${userId}; cache dibuang.`);
      await this.deps.kv.removeItem(this.cacheKey(userId));
      return [];
    }
    const valid: T[] = [];
    let rejected = 0;
    for (const entry of parsed) {
      const item = this.validateOwned(entry, userId);
      if (item) valid.push(item);
      else rejected++;
    }
    if (rejected > 0) {
      console.warn(`[${this.cfg.name}] ${rejected} entri cache tidak lolos skema/kepemilikan dan dibuang.`);
      await this.writeCache(userId, valid);
    }
    return this.sort(valid);
  }

  private async writeCache(userId: string, items: T[]) {
    await this.deps.kv.setItem(this.cacheKey(userId), JSON.stringify(this.sort(items)));
  }

  private async readQueue(userId: string): Promise<QueuedOp<T>[]> {
    const raw = await this.deps.kv.getItem(this.queueKey(userId));
    if (raw === null) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('queue bukan array');
      return parsed.filter((op): op is QueuedOp<T> => {
        if (!op || (op.kind !== 'upsert' && op.kind !== 'delete') || typeof op.docId !== 'string') return false;
        if (op.kind === 'upsert') return this.validateOwned(op.data, userId) !== null;
        return true;
      });
    } catch (err) {
      // A corrupt queue cannot be trusted; surface it instead of silently dropping writes.
      throw new Error(`Antrian sinkronisasi ${this.cfg.name} rusak: ${describeError(err)}`);
    }
  }

  private async writeQueue(userId: string, ops: QueuedOp<T>[]) {
    if (ops.length === 0) await this.deps.kv.removeItem(this.queueKey(userId));
    else await this.deps.kv.setItem(this.queueKey(userId), JSON.stringify(ops));
  }

  private applyOps(items: T[], ops: QueuedOp<T>[]): T[] {
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const op of ops) {
      if (op.kind === 'upsert' && op.data) byId.set(op.docId, op.data);
      else if (op.kind === 'delete') byId.delete(op.docId);
    }
    return this.sort(Array.from(byId.values()));
  }

  // ---------------------------------------------------------------- remote

  private docRef(userId: string, docId: string) {
    const [first, ...rest] = this.cfg.path(userId);
    return doc(this.deps.db!, first, ...rest, docId);
  }

  private async remoteWrite(userId: string, op: QueuedOp<T>) {
    const ref = this.docRef(userId, op.docId);
    const label = `Firestore ${op.kind} ${this.cfg.name}/${op.docId}`;
    if (op.kind === 'upsert') {
      await withTimeout(setDoc(ref, stripUndefined(op.data) as Record<string, unknown>), this.timeoutMs, label);
    } else {
      await withTimeout(deleteDoc(ref), this.timeoutMs, label);
    }
  }

  private async flushLocked(userId: string): Promise<Map<string, unknown>> {
    const permanentErrors = new Map<string, unknown>();
    if (this.deps.mode !== 'firebase') return permanentErrors;
    const queue = await this.readQueue(userId);
    const remaining: QueuedOp<T>[] = [];
    let blocked = false;
    for (const op of queue) {
      if (blocked || op.failed) {
        remaining.push(op);
        continue;
      }
      try {
        await this.remoteWrite(userId, op);
      } catch (err) {
        op.attempts += 1;
        op.lastError = describeError(err);
        if (isTransientRemoteError(err)) {
          blocked = true; // keep order: later ops wait for this one
        } else {
          op.failed = true;
          permanentErrors.set(op.docId, err);
        }
        remaining.push(op);
      }
    }
    await this.writeQueue(userId, remaining);
    return permanentErrors;
  }

  /** Push queued changes to Firestore. Safe to call any time. */
  async flush(userId: string): Promise<SyncState> {
    this.assertUsable(userId);
    await this.exclusive(userId, () => this.flushLocked(userId));
    return this.getSyncState(userId);
  }

  async getSyncState(userId: string): Promise<SyncState> {
    const queue = await this.readQueue(userId);
    const info = (op: QueuedOp<T>): PendingOperationInfo => ({
      docId: op.docId,
      kind: op.kind,
      enqueuedAt: op.enqueuedAt,
      attempts: op.attempts,
      lastError: op.lastError,
      failed: op.failed,
    });
    return {
      pending: queue.filter((op) => !op.failed).length,
      failed: queue.filter((op) => op.failed).map(info),
    };
  }

  // ---------------------------------------------------------------- reads

  async list(userId: string): Promise<T[]> {
    this.assertUsable(userId);
    if (this.isLocalOnly) return this.readCache(userId);

    return this.exclusive(userId, async () => {
      await this.flushLocked(userId);
      try {
        const [first, ...rest] = this.cfg.path(userId);
        const snapshot = await withTimeout(
          getDocs(query(collection(this.deps.db!, first, ...rest), orderBy(this.cfg.orderByField, 'desc'))),
          this.timeoutMs,
          `Firestore list ${this.cfg.name}`
        );
        if (snapshot.metadata.fromCache) throw new OfflineSnapshotError(`Firestore list ${this.cfg.name}`);
        const remote: T[] = [];
        snapshot.forEach((snap) => {
          const item = this.validateOwned({ id: snap.id, ...snap.data() }, userId);
          if (item && item.id === snap.id) remote.push(item);
          else console.warn(`[${this.cfg.name}] Dokumen ${snap.id} tidak lolos skema dan tidak ditampilkan.`);
        });
        const merged = this.applyOps(remote, await this.readQueue(userId));
        await this.writeCache(userId, merged);
        return merged;
      } catch (err) {
        if (isTransientRemoteError(err)) return this.readCache(userId);
        throw err;
      }
    });
  }

  async get(userId: string, docId: string): Promise<T | null> {
    this.assertUsable(userId);
    if (!docId) return null;
    if (!this.isLocalOnly) {
      const queue = await this.readQueue(userId);
      const pending = [...queue].reverse().find((op) => op.docId === docId);
      if (pending) return pending.kind === 'upsert' ? (pending.data as T) : null;
      try {
        const snap = await withTimeout(getDoc(this.docRef(userId, docId)), this.timeoutMs, `Firestore get ${this.cfg.name}/${docId}`);
        if (snap.metadata.fromCache) throw new OfflineSnapshotError(`Firestore get ${this.cfg.name}`);
        if (!snap.exists()) return null;
        const item = this.validateOwned({ id: snap.id, ...snap.data() }, userId);
        if (!item) throw new CorruptRemoteDataError(`Dokumen ${this.cfg.name}/${docId} tidak sesuai skema.`);
        return item;
      } catch (err) {
        if (!isTransientRemoteError(err)) throw err;
      }
    }
    const cached = await this.readCache(userId);
    return cached.find((i) => i.id === docId) ?? null;
  }

  // ---------------------------------------------------------------- writes

  /**
   * Apply a mutation optimistically to the cache, then sync. Returns the sync status
   * or throws (after rolling back) when Firestore rejects it permanently.
   */
  async mutate(userId: string, change: { kind: 'upsert'; data: T } | { kind: 'delete'; docId: string }): Promise<SyncStatus> {
    this.assertUsable(userId);
    const docId = change.kind === 'upsert' ? change.data.id : change.docId;
    if (change.kind === 'upsert' && !this.validateOwned(change.data, userId)) {
      throw new Error(`Data ${this.cfg.name} tidak valid atau bukan milik user ini.`);
    }

    return this.exclusive(userId, async () => {
      const before = await this.readCache(userId);
      const previous = before.find((i) => i.id === docId);
      const op: QueuedOp<T> = {
        kind: change.kind,
        docId,
        data: change.kind === 'upsert' ? change.data : undefined,
        enqueuedAt: this.now().toISOString(),
        attempts: 0,
        failed: false,
      };
      await this.writeCache(userId, this.applyOps(before, [op]));
      if (this.isLocalOnly) return 'local';

      const existingQueue = await this.readQueue(userId);
      const previousOp = existingQueue.find((q) => q.docId === docId);
      const queue = existingQueue.filter((q) => q.docId !== docId);
      queue.push(op);
      await this.writeQueue(userId, queue);

      const permanent = await this.flushLocked(userId);
      if (permanent.has(docId)) {
        // Roll back the optimistic change and drop the rejected op.
        const current = await this.readCache(userId);
        const restored = current.filter((i) => i.id !== docId);
        if (previous) restored.push(previous);
        await this.writeCache(userId, restored);
        const rest = (await this.readQueue(userId)).filter((q) => q.docId !== docId);
        // An earlier, still-unsynced change to the same doc must not be lost.
        await this.writeQueue(userId, previousOp ? [...rest, previousOp] : rest);
        throw permanent.get(docId);
      }
      const stillQueued = (await this.readQueue(userId)).some((q) => q.docId === docId);
      return stillQueued ? 'pending' : 'synced';
    });
  }

  /** Re-arm failed operations (e.g. after the user fixed a rules/config problem). */
  async retryFailed(userId: string): Promise<SyncState> {
    this.assertUsable(userId);
    await this.exclusive(userId, async () => {
      const queue = await this.readQueue(userId);
      await this.writeQueue(
        userId,
        queue.map((op) => ({ ...op, failed: false }))
      );
      await this.flushLocked(userId);
    });
    return this.getSyncState(userId);
  }

  async clear(userId: string): Promise<void> {
    if (!userId) throw new Error('User ID wajib diisi.');
    await this.exclusive(userId, async () => {
      await this.deps.kv.removeItem(this.cacheKey(userId));
      await this.deps.kv.removeItem(this.queueKey(userId));
    });
  }
}
