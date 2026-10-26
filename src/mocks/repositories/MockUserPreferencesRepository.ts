import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, FoodPreferences } from '../../models/preferences';
import { IUserPreferencesRepository } from '../../repositories/user-preferences/IUserPreferencesRepository';
import { MOCK_APP_SETTINGS } from '../data/mockPreferences';

const getStorageKey = (userId: string) => `@mouthjournal_mock_${userId}_settings`;

export class MockUserPreferencesRepository implements IUserPreferencesRepository {
  private inMemorySettings: Map<string, AppSettings> = new Map();

  async getSettings(userId: string): Promise<AppSettings> {
    if (!userId) return MOCK_APP_SETTINGS;

    if (this.inMemorySettings.has(userId)) {
      return this.inMemorySettings.get(userId)!;
    }

    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        this.inMemorySettings.set(userId, parsed);
        return parsed;
      }
    } catch {
      // Fallback
    }

    this.inMemorySettings.set(userId, MOCK_APP_SETTINGS);
    return MOCK_APP_SETTINGS;
  }

  async getPreferences(userId: string): Promise<any> {
    const s = await this.getSettings(userId);
    return s.foodPreferences;
  }

  async updateSettings(userId: string, updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings(userId);
    const updated: AppSettings = {
      ...current,
      ...updates,
      foodPreferences: {
        ...current.foodPreferences,
        ...(updates.foodPreferences || {}),
      },
    };

    this.inMemorySettings.set(userId, updated);
    try {
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  }

  async updatePreferences(userId: string, updates: any): Promise<any> {
    return this.updateFoodPreferences(userId, updates);
  }

  async updateFoodPreferences(
    userId: string,
    preferences: Partial<FoodPreferences>
  ): Promise<FoodPreferences> {
    const current = await this.getSettings(userId);
    const updatedPreferences: FoodPreferences = {
      ...current.foodPreferences,
      ...preferences,
      recommendationPreferences: {
        ...current.foodPreferences.recommendationPreferences,
        ...(preferences.recommendationPreferences || {}),
      },
    };

    await this.updateSettings(userId, { foodPreferences: updatedPreferences });
    return updatedPreferences;
  }

  async clearUserCache(userId: string): Promise<void> {
    this.inMemorySettings.delete(userId);
    try {
      await AsyncStorage.removeItem(getStorageKey(userId));
    } catch {
      // Ignore
    }
  }
}
