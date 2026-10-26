import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../config/firebase';
import {
  AppSettings,
  FoodPreferences,
  DEFAULT_APP_SETTINGS,
} from '../../models/preferences';
import { AppSettingsSchema } from '../../schemas/preferencesSchema';
import { IUserPreferencesRepository } from './IUserPreferencesRepository';

const getCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_settings`;

export class FirestoreUserPreferencesRepository implements IUserPreferencesRepository {
  /**
   * Mengambil AppSettings dari /users/{userId}/preferences/settings
   */
  async getSettings(userId: string): Promise<AppSettings> {
    if (!userId) return DEFAULT_APP_SETTINGS;

    // 1. Coba ambil dari Firestore
    if (isFirebaseConfigured && db) {
      try {
        const prefRef = doc(db, 'users', userId, 'preferences', 'settings');
        const docSnap = await getDoc(prefRef);
        if (docSnap.exists()) {
          const parsed = AppSettingsSchema.safeParse(docSnap.data());
          if (parsed.success) {
            await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(parsed.data));
            return parsed.data;
          }
        }
      } catch (err) {
        console.warn(`[PreferencesRepository] Gagal membaca dari Firestore untuk user ${userId}:`, err);
      }
    }

    // 2. Baca dari cache lokal
    const cached = await AsyncStorage.getItem(getCacheKey(userId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const validated = AppSettingsSchema.safeParse(parsed);
        if (validated.success) return validated.data;
      } catch {
        return DEFAULT_APP_SETTINGS;
      }
    }

    return DEFAULT_APP_SETTINGS;
  }

  /**
   * Memperbarui AppSettings
   */
  async updateSettings(userId: string, updates: Partial<AppSettings>): Promise<AppSettings> {
    if (!userId) throw new Error('User ID wajib diisi.');

    const current = await this.getSettings(userId);
    const merged: AppSettings = {
      ...current,
      ...updates,
      foodPreferences: {
        ...current.foodPreferences,
        ...(updates.foodPreferences || {}),
      },
    };

    const validated = AppSettingsSchema.parse(merged);

    if (isFirebaseConfigured && db) {
      const prefRef = doc(db, 'users', userId, 'preferences', 'settings');
      await setDoc(prefRef, validated);
    }

    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(validated));
    return validated;
  }

  /**
   * Memperbarui preferensi kuliner saja
   */
  async updateFoodPreferences(userId: string, preferences: Partial<FoodPreferences>): Promise<FoodPreferences> {
    const current = await this.getSettings(userId);
    const updatedFood = {
      ...current.foodPreferences,
      ...preferences,
    };

    const updatedSettings = await this.updateSettings(userId, {
      foodPreferences: updatedFood,
    });

    return updatedSettings.foodPreferences;
  }

  async getPreferences(userId: string): Promise<any> {
    const settings = await this.getSettings(userId);
    return {
      ...settings,
      themeMode: settings.appearance,
      favoriteCategories: settings.foodPreferences.favoriteCategories,
    };
  }

  async updatePreferences(userId: string, updates: any): Promise<any> {
    const patch: Partial<AppSettings> = {};
    if (updates.themeMode) {
      patch.appearance = updates.themeMode;
    }
    if (updates.appearance) {
      patch.appearance = updates.appearance;
    }
    if (updates.searchRadiusKm !== undefined) {
      patch.searchRadiusKm = updates.searchRadiusKm;
    }
    if (updates.favoriteCategories) {
      return this.updateFoodPreferences(userId, {
        favoriteCategories: updates.favoriteCategories,
      });
    }
    return this.updateSettings(userId, patch);
  }

  /**
   * Membersihkan cache saat logout
   */
  async clearUserCache(userId: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.removeItem(getCacheKey(userId));
  }
}
