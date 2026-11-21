/**
 * Remote call helpers shared by repositories.
 *
 * Firestore's web SDK does not reject writes while offline: the promise simply
 * stays pending until the server acknowledges it. We therefore bound every remote
 * call with a timeout and classify the outcome:
 *  - transient (offline / timeout / server unavailable) → keep the local change and
 *    leave the operation in the pending queue;
 *  - permanent (permission-denied, invalid-argument, ...) → surface the real error.
 */

export const DEFAULT_REMOTE_TIMEOUT_MS = 10_000;

export class RemoteTimeoutError extends Error {
  readonly code = 'deadline-exceeded';
  constructor(label: string, ms: number) {
    super(`${label} tidak merespons dalam ${ms} ms`);
    this.name = 'RemoteTimeoutError';
  }
}

export const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RemoteTimeoutError(label, ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

/**
 * When offline, getDocs/getDoc resolve from the SDK's in-memory cache instead of
 * failing. Such snapshots are not authoritative and must not overwrite our cache.
 */
export class OfflineSnapshotError extends Error {
  readonly code = 'unavailable';
  constructor(label: string) {
    super(`${label}: server tidak dapat dijangkau (snapshot dari cache SDK).`);
    this.name = 'OfflineSnapshotError';
  }
}

const TRANSIENT_CODES = new Set([
  'unavailable',
  'deadline-exceeded',
  'resource-exhausted',
  'aborted',
  'cancelled',
  'auth/network-request-failed',
  'storage/retry-limit-exceeded',
]);

export const errorCode = (err: unknown): string | undefined => {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
};

export const isTransientRemoteError = (err: unknown): boolean => {
  if (err instanceof RemoteTimeoutError) return true;
  const code = errorCode(err);
  if (code && TRANSIENT_CODES.has(code)) return true;
  // fetch-level network failures surface as TypeError without a code.
  return err instanceof TypeError && /network|fetch/i.test(err.message);
};

export const describeError = (err: unknown): string => {
  const code = errorCode(err);
  const message = err instanceof Error ? err.message : String(err);
  return code ? `${code}: ${message}` : message;
};

/** Thrown when a repository is used without Firebase while not in demo mode. */
export class BackendNotConfiguredError extends Error {
  readonly code = 'app/backend-not-configured';
  constructor() {
    super(
      'Firebase belum dikonfigurasi. Isi variabel EXPO_PUBLIC_FIREBASE_* atau aktifkan EXPO_PUBLIC_DEMO_MODE=true secara eksplisit.'
    );
    this.name = 'BackendNotConfiguredError';
  }
}

/**
 * Firestore rejects `undefined` field values. Optional schema fields may carry an
 * explicit undefined, so they are removed (recursively) before any remote write.
 */
export const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map((v) => stripUndefined(v)) as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
};
