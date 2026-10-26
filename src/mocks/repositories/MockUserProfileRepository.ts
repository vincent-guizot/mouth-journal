import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../models/user';
import { IUserProfileRepository } from '../../repositories/user-profile/IUserProfileRepository';
import { MOCK_USER_PROFILE } from '../data/mockUserProfile';

const getStorageKey = (userId: string) => `@mouthjournal_mock_${userId}_profile`;

export class MockUserProfileRepository implements IUserProfileRepository {
  private inMemoryProfiles: Map<string, UserProfile> = new Map();

  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;

    if (this.inMemoryProfiles.has(userId)) {
      return this.inMemoryProfiles.get(userId)!;
    }

    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        this.inMemoryProfiles.set(userId, parsed);
        return parsed;
      }
    } catch {
      // Fallback
    }

    const defaultProfile: UserProfile = {
      ...MOCK_USER_PROFILE,
      uid: userId,
    };
    this.inMemoryProfiles.set(userId, defaultProfile);
    return defaultProfile;
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    const toSave: UserProfile = {
      ...profile,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };
    this.inMemoryProfiles.set(userId, toSave);
    try {
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(toSave));
    } catch {
      // Ignore
    }
    return toSave;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = (await this.getProfile(userId)) || { ...MOCK_USER_PROFILE, uid: userId };
    const updated: UserProfile = {
      ...current,
      ...updates,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };
    this.inMemoryProfiles.set(userId, updated);
    try {
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  }

  async clearUserCache(userId: string): Promise<void> {
    this.inMemoryProfiles.delete(userId);
    try {
      await AsyncStorage.removeItem(getStorageKey(userId));
    } catch {
      // Ignore
    }
  }
}
