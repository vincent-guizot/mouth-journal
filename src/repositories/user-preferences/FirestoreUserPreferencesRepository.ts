import { AppSettings, DEFAULT_APP_SETTINGS, FoodPreferences } from '../../models/preferences';
import { AppSettingsSchema, PreferencesPatch, PreferencesPatchSchema } from '../../schemas/preferencesSchema';
import { OfflineDocument } from '../sync/OfflineDocument';
import { MutationResult, RepositoryDeps } from '../sync/types';
import { IUserPreferencesRepository } from './IUserPreferencesRepository';

/** Pure merge used by the repository (exported for unit tests). */
export const mergePreferencesPatch = (current: AppSettings, rawPatch: PreferencesPatch): AppSettings => {
  const patch = PreferencesPatchSchema.parse(rawPatch);
  const food: FoodPreferences = { ...current.foodPreferences };
  if (patch.favoriteCategories !== undefined) food.favoriteCategories = patch.favoriteCategories;
  if (patch.preferredVenueTypes !== undefined) food.preferredVenueTypes = patch.preferredVenueTypes;
  if (patch.budgetPerVisit !== undefined) food.budgetPerVisit = patch.budgetPerVisit;
  return AppSettingsSchema.parse({
    ...current,
    ...(patch.appearance !== undefined && { appearance: patch.appearance }),
    ...(patch.searchRadiusKm !== undefined && { searchRadiusKm: patch.searchRadiusKm }),
    ...(patch.useLocationForJournals !== undefined && { useLocationForJournals: patch.useLocationForJournals }),
    foodPreferences: food,
  });
};

/** /users/{uid}/preferences/settings */
export class FirestoreUserPreferencesRepository implements IUserPreferencesRepository {
  private readonly store: OfflineDocument<AppSettings>;

  constructor(deps: RepositoryDeps) {
    this.store = new OfflineDocument<AppSettings>(deps, {
      name: 'settings',
      path: (uid) => ['users', uid, 'preferences', 'settings'],
      schema: AppSettingsSchema,
    });
  }

  async getSettings(userId: string): Promise<AppSettings> {
    return (await this.store.get(userId)) ?? DEFAULT_APP_SETTINGS;
  }

  async updatePreferences(userId: string, patch: PreferencesPatch): Promise<MutationResult<AppSettings>> {
    this.store.assertUsable(userId);
    const merged = mergePreferencesPatch(await this.getSettings(userId), patch);
    const sync = await this.store.set(userId, merged);
    return { data: merged, sync };
  }

  async updateFoodPreferences(userId: string, preferences: Partial<FoodPreferences>): Promise<MutationResult<AppSettings>> {
    this.store.assertUsable(userId);
    const current = await this.getSettings(userId);
    const merged = AppSettingsSchema.parse({
      ...current,
      foodPreferences: { ...current.foodPreferences, ...preferences },
    });
    const sync = await this.store.set(userId, merged);
    return { data: merged, sync };
  }

  clearUserCache(userId: string): Promise<void> {
    return this.store.clear(userId);
  }
}
