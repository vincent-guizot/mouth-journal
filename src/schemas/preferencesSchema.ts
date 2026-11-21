import { z } from 'zod';
import { IsoDateTimeSchema } from './common';

export const FoodPreferencesSchema = z.object({
  favoriteCategories: z.array(z.string().min(1).max(60)).max(30).default([]),
  preferredVenueTypes: z.array(z.string().min(1).max(60)).max(30).default([]),
  budgetPerVisit: z.string().max(60).optional(),
  defaultExploreFilters: z.array(z.string()).default(['all']),
  recommendationPreferences: z.object({
    enableAI: z.boolean().default(true),
    personalizedMenu: z.boolean().default(true),
  }),
});

export const AppearanceSchema = z.enum(['light', 'dark', 'system']);
export const SearchRadiusKmSchema = z.number().min(1).max(20);

export const AppSettingsSchema = z.object({
  appearance: AppearanceSchema.default('light'),
  locationPermissionsGranted: z.boolean().default(true),
  searchRadiusKm: SearchRadiusKmSchema.default(5),
  useLocationForJournals: z.boolean().default(true),
  distanceUnit: z.literal('km').default('km'),
  foodPreferences: FoodPreferencesSchema,
  lastBackupDate: IsoDateTimeSchema.optional(),
  appVersion: z.string().default('1.0.0'),
});

/**
 * Patch accepted by `updatePreferences`. Every field is optional and any
 * combination is merged in a single write; unknown keys are rejected.
 */
export const PreferencesPatchSchema = z
  .object({
    appearance: AppearanceSchema.optional(),
    searchRadiusKm: SearchRadiusKmSchema.optional(),
    useLocationForJournals: z.boolean().optional(),
    favoriteCategories: z.array(z.string().min(1).max(60)).max(30).optional(),
    preferredVenueTypes: z.array(z.string().min(1).max(60)).max(30).optional(),
    budgetPerVisit: z.string().max(60).optional(),
  })
  .strict();

export type AppSettingsInput = z.infer<typeof AppSettingsSchema>;
export type PreferencesPatch = z.infer<typeof PreferencesPatchSchema>;
