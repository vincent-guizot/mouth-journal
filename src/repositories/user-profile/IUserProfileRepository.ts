import { UserProfile } from '../../models/user';
import { MutationResult } from '../sync/types';

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  /** Creates or replaces /users/{uid}. uid is forced to userId. */
  saveProfile(userId: string, profile: UserProfile): Promise<MutationResult<UserProfile>>;
  /** Fails with ProfileNotFoundError when the profile does not exist yet. */
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<MutationResult<UserProfile>>;
  clearUserCache(userId: string): Promise<void>;
}
