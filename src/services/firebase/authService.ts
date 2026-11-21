import { appMode, auth, db, storage } from '../../config/firebase';
import { repositories } from '../../repositories';
import { asyncStorageKv } from '../../storage/asyncStorageKv';
import { AuthService } from '../auth/AuthService';

export { AuthService, AuthError, PendingChangesError, toAuthError, PasswordPolicySchema } from '../auth/AuthService';
export type { SessionUser, DeleteAccountReport } from '../auth/AuthService';
export type { UserProfile } from '../../models/user';

/** App-wide auth service bound to the configured Firebase project (or explicit demo mode). */
export const authService = new AuthService({
  mode: appMode,
  auth,
  db,
  storage,
  kv: asyncStorageKv,
  repositories,
});
