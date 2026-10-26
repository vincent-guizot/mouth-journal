import { AppSettings, FoodPreferences } from '../../models/preferences';

export interface IUserPreferencesRepository {
  /**
   * Mengambil pengaturan aplikasi dan preferensi kuliner pengguna
   */
  getSettings(userId: string): Promise<AppSettings>;
  getPreferences?(userId: string): Promise<any>;

  /**
   * Memperbarui pengaturan aplikasi
   */
  updateSettings(userId: string, updates: Partial<AppSettings>): Promise<AppSettings>;
  updatePreferences?(userId: string, updates: any): Promise<any>;

  /**
   * Memperbarui preferensi kuliner spesifik
   */
  updateFoodPreferences(userId: string, preferences: Partial<FoodPreferences>): Promise<FoodPreferences>;

  /**
   * Membersihkan cache saat logout
   */
  clearUserCache(userId: string): Promise<void>;
}
