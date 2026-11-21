import {
  Auth,
  EmailAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { Firestore, collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { FirebaseStorage, StorageReference, deleteObject, listAll, ref } from 'firebase/storage';
import { z } from 'zod';
import { AppMode, DEMO_USER_ID } from '../../config/env';
import { UserProfile } from '../../models/user';
import type { RepositoryBundle } from '../../repositories/createRepositories';
import { BackendNotConfiguredError, errorCode } from '../../repositories/sync/remote';
import { KeyValueStore, clearAllUserKeys } from '../../storage/keyValueStore';

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'password' | 'demo';
}

export interface AuthServiceDeps {
  mode: AppMode;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  kv: KeyValueStore;
  repositories: RepositoryBundle;
}

export class AuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class PendingChangesError extends Error {
  readonly code = 'app/pending-changes';
  constructor(readonly pendingCount: number) {
    super(`${pendingCount} perubahan belum tersinkron ke cloud dan akan hilang jika Anda keluar sekarang.`);
    this.name = 'PendingChangesError';
  }
}

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/missing-email': 'Email wajib diisi.',
  'auth/user-disabled': 'Akun ini dinonaktifkan.',
  'auth/user-not-found': 'Email atau password salah.',
  'auth/wrong-password': 'Email atau password salah.',
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/invalid-login-credentials': 'Email atau password salah.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
  'auth/email-already-in-use': 'Email sudah terdaftar. Silakan masuk atau reset password.',
  'auth/weak-password': 'Password terlalu lemah.',
  'auth/network-request-failed': 'Tidak ada koneksi internet. Periksa jaringan lalu coba lagi.',
  'auth/requires-recent-login': 'Demi keamanan, masukkan ulang password Anda.',
  'auth/operation-not-allowed': 'Metode login email/password belum diaktifkan di Firebase Console.',
};

/** Map any Firebase/Auth error to an AuthError with a user-facing message. Never swallows. */
export const toAuthError = (err: unknown, fallback = 'Autentikasi gagal.'): AuthError => {
  if (err instanceof AuthError) return err;
  const code = errorCode(err) ?? 'unknown';
  const base = AUTH_MESSAGES[code];
  const detail = err instanceof Error ? err.message : String(err);
  return new AuthError(code, base ?? `${fallback} (${code}: ${detail})`, err);
};

const EmailSchema = z.email('Format email tidak valid.');
export const PasswordPolicySchema = z
  .string()
  .min(8, 'Password minimal 8 karakter.')
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf.')
  .regex(/[0-9]/, 'Password harus mengandung angka.');

const parseOrThrow = <T>(schema: z.ZodType<T>, value: unknown, code: string): T => {
  const r = schema.safeParse(value);
  if (!r.success) throw new AuthError(code, r.error.issues[0]?.message ?? 'Input tidak valid.');
  return r.data;
};

const DEMO_SESSION_KEY = '@mouthjournal_demo_session';
const DemoSessionSchema = z.object({
  uid: z.literal(DEMO_USER_ID),
  email: z.email(),
  displayName: z.string().min(1),
  emailVerified: z.literal(false),
  provider: z.literal('demo'),
});

export const sessionFromFirebaseUser = (u: FirebaseUser): SessionUser => {
  if (!u.email) throw new AuthError('app/missing-email', 'Akun Firebase ini tidak memiliki email.');
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName || u.email.split('@')[0],
    photoURL: u.photoURL ?? undefined,
    emailVerified: u.emailVerified,
    provider: 'password',
  };
};

export interface DeleteAccountReport {
  firestoreDocumentsDeleted: number;
  storageFilesDeleted: number;
}

export class AuthService {
  private demoListeners = new Set<(u: SessionUser | null) => void>();

  constructor(private readonly deps: AuthServiceDeps) {}

  get mode(): AppMode {
    return this.deps.mode;
  }

  /** Social providers need native config (client IDs, Apple capability) that this project does not have. */
  readonly socialSignInAvailable = { google: false, apple: false } as const;

  private requireAuth(): Auth {
    if (this.deps.mode === 'unconfigured') throw new BackendNotConfiguredError();
    if (!this.deps.auth) throw new BackendNotConfiguredError();
    return this.deps.auth;
  }

  private assertConfigured() {
    if (this.deps.mode === 'unconfigured') throw new BackendNotConfiguredError();
  }

  // ------------------------------------------------------------ session

  /**
   * Firebase Auth is the source of truth: the callback fires with the verified
   * Firebase user (or null). No stale AsyncStorage session is trusted first.
   */
  subscribe(callback: (user: SessionUser | null) => void, onError?: (err: unknown) => void): () => void {
    if (this.deps.mode === 'firebase' && this.deps.auth) {
      return onAuthStateChanged(
        this.deps.auth,
        (u) => {
          try {
            callback(u ? sessionFromFirebaseUser(u) : null);
          } catch (err) {
            onError?.(err);
            callback(null);
          }
        },
        (err) => onError?.(err)
      );
    }
    if (this.deps.mode === 'demo') {
      this.demoListeners.add(callback);
      this.readDemoSession().then(callback, (err) => {
        onError?.(err);
        callback(null);
      });
      return () => this.demoListeners.delete(callback);
    }
    queueMicrotask(() => callback(null));
    return () => undefined;
  }

  getCurrentSession(): Promise<SessionUser | null> {
    if (this.deps.mode === 'firebase' && this.deps.auth) {
      const u = this.deps.auth.currentUser;
      return Promise.resolve(u ? sessionFromFirebaseUser(u) : null);
    }
    if (this.deps.mode === 'demo') return this.readDemoSession();
    return Promise.resolve(null);
  }

  private async readDemoSession(): Promise<SessionUser | null> {
    const raw = await this.deps.kv.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = DemoSessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      await this.deps.kv.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return parsed.data;
  }

  private emitDemo(user: SessionUser | null) {
    this.demoListeners.forEach((l) => l(user));
  }

  private async startDemoSession(email: string, displayName?: string): Promise<SessionUser> {
    const existing = await this.deps.repositories.userProfileRepository.getProfile(DEMO_USER_ID);
    const session: SessionUser = {
      uid: DEMO_USER_ID,
      email,
      displayName: displayName?.trim() || existing?.displayName || email.split('@')[0],
      emailVerified: false,
      provider: 'demo',
    };
    await this.deps.kv.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    await this.ensureProfile(session);
    this.emitDemo(session);
    return session;
  }

  // ------------------------------------------------------------ profile sync

  /**
   * Load /users/{uid}; create it from the auth identity if missing. Auth is the
   * source of truth for uid and email (email changes only after verification).
   */
  async ensureProfile(session: SessionUser): Promise<UserProfile> {
    const repo = this.deps.repositories.userProfileRepository;
    const existing = await repo.getProfile(session.uid);
    if (!existing) {
      const { data } = await repo.saveProfile(session.uid, {
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        ...(session.photoURL && { photoURL: session.photoURL }),
        culinaryPreferences: [],
        favoriteVenueTypes: [],
        favoriteLocations: [],
      });
      return data;
    }
    if (existing.email !== session.email) {
      const { data } = await repo.updateProfile(session.uid, { email: session.email });
      return data;
    }
    return existing;
  }

  // ------------------------------------------------------------ flows

  async login(emailInput: string, password: string): Promise<SessionUser> {
    const email = parseOrThrow(EmailSchema, emailInput.trim(), 'auth/invalid-email');
    if (!password) throw new AuthError('auth/missing-password', 'Password wajib diisi.');
    this.assertConfigured();
    if (this.deps.mode === 'demo') return this.startDemoSession(email);
    try {
      const cred = await signInWithEmailAndPassword(this.requireAuth(), email, password);
      return sessionFromFirebaseUser(cred.user);
    } catch (err) {
      throw toAuthError(err, 'Login gagal.');
    }
  }

  async register(emailInput: string, password: string, displayNameInput: string): Promise<SessionUser> {
    const email = parseOrThrow(EmailSchema, emailInput.trim(), 'auth/invalid-email');
    const displayName = parseOrThrow(z.string().trim().min(1, 'Nama wajib diisi.').max(80), displayNameInput, 'app/invalid-name');
    parseOrThrow(PasswordPolicySchema, password, 'auth/weak-password');
    this.assertConfigured();
    if (this.deps.mode === 'demo') return this.startDemoSession(email, displayName);

    let user: FirebaseUser;
    try {
      const cred = await createUserWithEmailAndPassword(this.requireAuth(), email, password);
      user = cred.user;
      await updateFirebaseProfile(user, { displayName });
    } catch (err) {
      throw toAuthError(err, 'Pendaftaran gagal.');
    }
    const session = { ...sessionFromFirebaseUser(user), displayName };
    try {
      await this.ensureProfile(session);
    } catch (err) {
      throw new AuthError(
        'app/profile-create-failed',
        `Akun dibuat, tetapi profil gagal disimpan ke Firestore: ${err instanceof Error ? err.message : String(err)}`,
        err
      );
    }
    return session;
  }

  /** Sends the real Firebase reset email. Throws on any failure. */
  async sendPasswordReset(emailInput: string): Promise<void> {
    const email = parseOrThrow(EmailSchema, emailInput.trim(), 'auth/invalid-email');
    if (this.deps.mode !== 'firebase') {
      this.assertConfigured();
      throw new AuthError('app/unsupported-in-demo', 'Reset password membutuhkan Firebase dan tidak tersedia di mode demo lokal.');
    }
    try {
      await sendPasswordResetEmail(this.requireAuth(), email);
    } catch (err) {
      throw toAuthError(err, 'Gagal mengirim email reset password.');
    }
  }

  async countPendingChanges(uid: string): Promise<number> {
    const { journalRepository, wishlistRepository } = this.deps.repositories;
    const [j, w] = await Promise.all([journalRepository.getSyncState(uid), wishlistRepository.getSyncState(uid)]);
    return j.pending + j.failed.length + w.pending + w.failed.length;
  }

  /**
   * Firebase: tries to sync first; refuses (PendingChangesError) to drop unsynced
   * changes unless discardPending is true. Clears every cache key of the user.
   * Demo: only ends the session, local data stays (it is the only copy).
   */
  async logout(options: { discardPending?: boolean } = {}): Promise<void> {
    const session = await this.getCurrentSession();
    if (this.deps.mode === 'demo') {
      await this.deps.kv.removeItem(DEMO_SESSION_KEY);
      this.emitDemo(null);
      return;
    }
    const auth = this.requireAuth();
    if (session) {
      const { journalRepository, wishlistRepository } = this.deps.repositories;
      if (!options.discardPending && (await this.countPendingChanges(session.uid)) > 0) {
        await Promise.allSettled([journalRepository.syncPending(session.uid), wishlistRepository.syncPending(session.uid)]);
        const remaining = await this.countPendingChanges(session.uid);
        if (remaining > 0) throw new PendingChangesError(remaining);
      }
    }
    try {
      await signOut(auth);
    } catch (err) {
      throw toAuthError(err, 'Gagal keluar.');
    }
    if (session) await clearAllUserKeys(this.deps.kv, session.uid);
  }

  /**
   * Updates Firebase Auth (displayName/photoURL; email via verification link) and
   * the Firestore profile consistently. The new email is written to Firestore only
   * after Firebase confirms it (see ensureProfile).
   */
  async updateAccountProfile(
    uid: string,
    patch: Partial<UserProfile>
  ): Promise<{ profile: UserProfile; emailVerificationSentTo?: string }> {
    this.assertConfigured();
    const { email: requestedEmail, uid: _ignored, ...rest } = patch;
    const profilePatch: Partial<UserProfile> = { ...rest };
    let emailVerificationSentTo: string | undefined;

    if (this.deps.mode === 'firebase') {
      const user = this.requireAuth().currentUser;
      if (!user || user.uid !== uid) throw new AuthError('app/not-signed-in', 'Sesi login tidak valid. Silakan masuk ulang.');
      try {
        if (rest.displayName !== undefined || rest.photoURL !== undefined) {
          await updateFirebaseProfile(user, {
            ...(rest.displayName !== undefined && { displayName: rest.displayName }),
            ...(rest.photoURL !== undefined && { photoURL: rest.photoURL }),
          });
        }
        if (requestedEmail && requestedEmail.trim() !== user.email) {
          const nextEmail = parseOrThrow(EmailSchema, requestedEmail.trim(), 'auth/invalid-email');
          await verifyBeforeUpdateEmail(user, nextEmail);
          emailVerificationSentTo = nextEmail;
        }
      } catch (err) {
        throw toAuthError(err, 'Gagal memperbarui akun.');
      }
    } else if (requestedEmail) {
      profilePatch.email = parseOrThrow(EmailSchema, requestedEmail.trim(), 'auth/invalid-email');
    }

    const { data } = await this.deps.repositories.userProfileRepository.updateProfile(uid, profilePatch);
    if (this.deps.mode === 'demo') {
      const session = await this.readDemoSession();
      if (session) {
        const next = { ...session, displayName: data.displayName, email: data.email };
        await this.deps.kv.setItem(DEMO_SESSION_KEY, JSON.stringify(next));
        this.emitDemo(next);
      }
    }
    return { profile: data, emailVerificationSentTo };
  }

  // ------------------------------------------------------------ delete account

  private async deleteStorageFolder(folder: StorageReference): Promise<number> {
    const listing = await listAll(folder);
    let count = 0;
    for (const item of listing.items) {
      await deleteObject(item);
      count++;
    }
    for (const prefix of listing.prefixes) count += await this.deleteStorageFolder(prefix);
    return count;
  }

  /** Deletes every Firestore document and Storage object owned by uid. */
  async deleteUserData(uid: string): Promise<DeleteAccountReport> {
    const { db, storage } = this.deps;
    if (!db || !storage) throw new BackendNotConfiguredError();
    let firestoreDocumentsDeleted = 0;
    for (const sub of ['journals', 'wishlist', 'menuWishlist', 'preferences']) {
      const snap = await getDocs(collection(db, 'users', uid, sub));
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      firestoreDocumentsDeleted += docs.length;
    }
    await deleteDoc(doc(db, 'users', uid));
    firestoreDocumentsDeleted += 1;
    const storageFilesDeleted = await this.deleteStorageFolder(ref(storage, `users/${uid}`));
    return { firestoreDocumentsDeleted, storageFilesDeleted };
  }

  /**
   * Full account deletion:
   *  1. re-authenticate with the current password (Firebase requires a recent login);
   *  2. delete Firestore subcollections + profile doc and all Storage photos;
   *  3. delete the Firebase Auth user;
   *  4. clear every local cache/queue key of the user.
   * Any failure is thrown; the Auth user is only deleted after the data is gone, so a
   * failed run can be retried.
   */
  async deleteAccount(password: string): Promise<DeleteAccountReport> {
    this.assertConfigured();
    if (this.deps.mode === 'demo') {
      await clearAllUserKeys(this.deps.kv, DEMO_USER_ID);
      await this.deps.kv.removeItem(DEMO_SESSION_KEY);
      this.emitDemo(null);
      return { firestoreDocumentsDeleted: 0, storageFilesDeleted: 0 };
    }
    const user = this.requireAuth().currentUser;
    if (!user || !user.email) throw new AuthError('app/not-signed-in', 'Tidak ada sesi login aktif.');
    if (!password) throw new AuthError('auth/missing-password', 'Masukkan password untuk konfirmasi penghapusan akun.');

    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    } catch (err) {
      throw toAuthError(err, 'Verifikasi password gagal.');
    }

    let report: DeleteAccountReport;
    try {
      report = await this.deleteUserData(user.uid);
    } catch (err) {
      throw new AuthError(
        errorCode(err) ?? 'app/delete-data-failed',
        `Gagal menghapus data akun (akun belum dihapus, coba lagi): ${err instanceof Error ? err.message : String(err)}`,
        err
      );
    }

    try {
      await deleteUser(user);
    } catch (err) {
      throw toAuthError(err, 'Data sudah dihapus, tetapi akun Firebase gagal dihapus.');
    }
    await clearAllUserKeys(this.deps.kv, user.uid);
    return report;
  }
}
