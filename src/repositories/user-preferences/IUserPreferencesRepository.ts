import { AppSettings, FoodPreferences } from '../../models/preferences';
import { PreferencesPatch } from '../../schemas/preferencesSchema';
import { MutationResult } from '../sync/types';

export interface IUserPreferencesRepository {
  /** Stored settings, or DEFAULT_APP_SETTINGS when the user never saved any. */
  getSettings(userId: string): Promise<AppSettings>;
  /**
   * Merge a validated patch into the current settings in ONE write. Any combination
   * of appearance / radius / categories / venue types is preserved.
   */
  updatePreferences(userId: string, patch: PreferencesPatch): Promise<MutationResult<AppSettings>>;
  updateFoodPreferences(userId: string, preferences: Partial<FoodPreferences>): Promise<MutationResult<AppSettings>>;
  clearUserCache(userId: string): Promise<void>;
}
