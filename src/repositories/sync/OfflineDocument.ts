import { doc, getDoc, setDoc } from 'firebase/firestore';
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
import type { RepositoryDeps, SyncStatus } from './types';

interface PendingWrite<T> {
  data: T;
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
}

/**
 * Offline-first single document per user (profile, settings). Same contract as
 * OfflineCollection: validated cache, persistent pending write, rollback on
 * permanent remote rejection.
 */
export class OfflineDocument<T> {
  private lock: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly deps: RepositoryDeps,
    private readonly cfg: {
      name: string;
      path: (userId: string) => [string, ...string[]];
      schema: ZodType<T>;
      /** Extra ownership check (e.g. profile.uid === userId). */
      isOwnedBy?: (value: T, userId: string) => boolean;
    }
  ) {}

  get isLocalOnly() {
    return this.deps.mode === 'demo';
  }

  now() {
    return this.deps.now ? this.deps.now() : new Date();
  }

  assertUsable(userId: string) {
    if (!userId) throw new Error('User ID wajib diisi.');
    if (this.deps.mode === 'unconfigured') throw new BackendNotConfiguredError();
    if (this.deps.mode === 'firebase' && !this.deps.db) throw new BackendNotConfiguredError();
  }

  private exclusive<R>(fn: () => Promise<R>): Promise<R> {
    const next = this.lock.then(fn, fn);
    this.lock = next.catch(() => undefined);
    return next;
  }

  private cacheKey(userId: string) {
    return `${userKeyPrefix(userId)}${this.cfg.name}`;
  }
  private pendingKey(userId: string) {
    return `${userKeyPrefix(userId)}${this.cfg.name}_pending`;
  }

  private validate(raw: unknown, userId: string): T | null {
    const parsed = this.cfg.schema.safeParse(raw);
    if (!parsed.success) return null;
    if (this.cfg.isOwnedBy && !this.cfg.isOwnedBy(parsed.data, userId)) return null;
    return parsed.data;
  }

  async readCache(userId: string): Promise<T | null> {
    const raw = await this.deps.kv.getItem(this.cacheKey(userId));
    if (raw === null) return null;
    try {
      const value = this.validate(JSON.parse(raw), userId);
      if (value) return value;
    } catch {
      /* fallthrough: corrupt JSON */
    }
    console.warn(`[${this.cfg.name}] Cache tidak valid untuk user ${userId}; dibuang.`);
    await this.deps.kv.removeItem(this.cacheKey(userId));
    return null;
  }

  private async readPending(userId: string): Promise<PendingWrite<T> | null> {
    const raw = await this.deps.kv.getItem(this.pendingKey(userId));
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as PendingWrite<T>;
    const data = this.validate(parsed.data, userId);
    if (!data) throw new Error(`Perubahan tertunda ${this.cfg.name} rusak.`);
    return { ...parsed, data };
  }

  private ref(userId: string) {
    const [first, ...rest] = this.cfg.path(userId);
    return doc(this.deps.db!, first, ...rest);
  }

  private get timeoutMs() {
    return this.deps.remoteTimeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS;
  }

  /** Returns the permanent error if Firestore rejected the pending write. */
  private async flushLocked(userId: string): Promise<unknown | undefined> {
    if (this.deps.mode !== 'firebase') return undefined;
    const pending = await this.readPending(userId);
    if (!pending) return undefined;
    try {
      await withTimeout(setDoc(this.ref(userId), stripUndefined(pending.data) as Record<string, unknown>), this.timeoutMs, `Firestore set ${this.cfg.name}`);
      await this.deps.kv.removeItem(this.pendingKey(userId));
      return undefined;
    } catch (err) {
      const updated = { ...pending, attempts: pending.attempts + 1, lastError: describeError(err) };
      await this.deps.kv.setItem(this.pendingKey(userId), JSON.stringify(updated));
      return isTransientRemoteError(err) ? undefined : err;
    }
  }

  async hasPending(userId: string): Promise<boolean> {
    return (await this.readPending(userId)) !== null;
  }

  async get(userId: string): Promise<T | null> {
    this.assertUsable(userId);
    if (this.isLocalOnly) return this.readCache(userId);
    return this.exclusive(async () => {
      await this.flushLocked(userId);
      const pending = await this.readPending(userId);
      if (pending) return pending.data;
      try {
        const snap = await withTimeout(getDoc(this.ref(userId)), this.timeoutMs, `Firestore get ${this.cfg.name}`);
        if (snap.metadata.fromCache) throw new OfflineSnapshotError(`Firestore get ${this.cfg.name}`);
        if (!snap.exists()) {
          await this.deps.kv.removeItem(this.cacheKey(userId));
          return null;
        }
        const value = this.validate(snap.data(), userId);
        if (!value) throw new Error(`Dokumen ${this.cfg.name} di Firestore tidak sesuai skema.`);
        await this.deps.kv.setItem(this.cacheKey(userId), JSON.stringify(value));
        return value;
      } catch (err) {
        if (isTransientRemoteError(err)) return this.readCache(userId);
        throw err;
      }
    });
  }

  async set(userId: string, value: T): Promise<SyncStatus> {
    this.assertUsable(userId);
    const validated = this.validate(value, userId);
    if (!validated) {
      // Re-run parse to throw the descriptive ZodError (or ownership error).
      this.cfg.schema.parse(value);
      throw new Error(`Data ${this.cfg.name} bukan milik user ini.`);
    }
    return this.exclusive(async () => {
      const previous = await this.readCache(userId);
      await this.deps.kv.setItem(this.cacheKey(userId), JSON.stringify(validated));
      if (this.isLocalOnly) return 'local';
      const pendingBefore = await this.deps.kv.getItem(this.pendingKey(userId));
      const write: PendingWrite<T> = { data: validated, enqueuedAt: this.now().toISOString(), attempts: 0 };
      await this.deps.kv.setItem(this.pendingKey(userId), JSON.stringify(write));
      const permanent = await this.flushLocked(userId);
      if (permanent !== undefined) {
        if (previous) await this.deps.kv.setItem(this.cacheKey(userId), JSON.stringify(previous));
        else await this.deps.kv.removeItem(this.cacheKey(userId));
        if (pendingBefore) await this.deps.kv.setItem(this.pendingKey(userId), pendingBefore);
        else await this.deps.kv.removeItem(this.pendingKey(userId));
        throw permanent;
      }
      return (await this.hasPending(userId)) ? 'pending' : 'synced';
    });
  }

  async flush(userId: string): Promise<{ pending: boolean }> {
    this.assertUsable(userId);
    const err = await this.exclusive(() => this.flushLocked(userId));
    if (err !== undefined) throw err;
    return { pending: await this.hasPending(userId) };
  }

  async clear(userId: string) {
    if (!userId) throw new Error('User ID wajib diisi.');
    await this.exclusive(async () => {
      await this.deps.kv.removeItem(this.cacheKey(userId));
      await this.deps.kv.removeItem(this.pendingKey(userId));
    });
  }
}
