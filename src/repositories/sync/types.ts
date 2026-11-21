import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { KeyValueStore } from '../../storage/keyValueStore';
import type { ImageFolder } from '../../services/images/imageUpload';

/**
 * Outcome of a mutation:
 *  - 'synced'  : persisted locally and acknowledged by Firestore.
 *  - 'pending' : persisted locally; Firestore unreachable, queued for retry.
 *  - 'local'   : explicit demo mode, there is no remote by design.
 */
export type SyncStatus = 'synced' | 'pending' | 'local';

export interface MutationResult<T> {
  data: T;
  sync: SyncStatus;
}

export interface PendingOperationInfo {
  docId: string;
  kind: 'upsert' | 'delete';
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
  /** true once a permanent error (e.g. permission-denied) was received. */
  failed: boolean;
}

export interface SyncState {
  pending: number;
  failed: PendingOperationInfo[];
}

/**
 * Backend for repositories.
 *  - mode 'firebase': `db` is required, writes go to Firestore with a local queue.
 *  - mode 'demo'    : local only, no remote and no queue.
 *  - mode 'unconfigured': every call throws BackendNotConfiguredError.
 */
export interface RepositoryDeps {
  mode: 'firebase' | 'demo' | 'unconfigured';
  db: Firestore | null;
  storage?: FirebaseStorage | null;
  kv: KeyValueStore;
  remoteTimeoutMs?: number;
  now?: () => Date;
  uploadPhoto?: (uri: string, userId: string, folder: ImageFolder) => Promise<{ url: string }>;
}
