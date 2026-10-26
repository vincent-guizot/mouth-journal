import { UserProfile } from '../../models/user';

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(userId: string, profile: UserProfile): Promise<UserProfile>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  clearUserCache(userId: string): Promise<void>;
}
