import { UserProfile } from '../../models/user';
import { userProfileSchemaFor } from '../../schemas/userSchema';
import { OfflineDocument } from '../sync/OfflineDocument';
import { MutationResult, RepositoryDeps } from '../sync/types';
import { IUserProfileRepository } from './IUserProfileRepository';

export class ProfileNotFoundError extends Error {
  readonly code = 'app/profile-not-found';
  constructor(userId: string) {
    super(`Profil untuk user ${userId} belum ada.`);
    this.name = 'ProfileNotFoundError';
  }
}

/** /users/{uid} */
export class FirestoreUserProfileRepository implements IUserProfileRepository {
  private readonly store: OfflineDocument<UserProfile>;
  private readonly schema;

  constructor(deps: RepositoryDeps) {
    this.schema = userProfileSchemaFor(deps.mode === 'demo');
    this.store = new OfflineDocument<UserProfile>(deps, {
      name: 'profile',
      path: (uid) => ['users', uid],
      schema: this.schema,
      isOwnedBy: (p, uid) => p.uid === uid,
    });
  }

  getProfile(userId: string): Promise<UserProfile | null> {
    return this.store.get(userId);
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<MutationResult<UserProfile>> {
    this.store.assertUsable(userId);
    const now = this.store.now().toISOString();
    const validated = this.schema.parse({
      ...profile,
      uid: userId,
      createdAt: profile.createdAt ?? now,
      updatedAt: now,
    });
    const sync = await this.store.set(userId, validated);
    return { data: validated, sync };
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<MutationResult<UserProfile>> {
    this.store.assertUsable(userId);
    const current = await this.store.get(userId);
    if (!current) throw new ProfileNotFoundError(userId);
    const { uid: _uid, createdAt: _c, ...rest } = updates;
    const validated = this.schema.parse({
      ...current,
      ...rest,
      uid: userId,
      createdAt: current.createdAt,
      updatedAt: this.store.now().toISOString(),
    });
    const sync = await this.store.set(userId, validated);
    return { data: validated, sync };
  }

  clearUserCache(userId: string): Promise<void> {
    return this.store.clear(userId);
  }
}
