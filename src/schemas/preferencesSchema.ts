import { z } from 'zod';

export const FoodPreferencesSchema = z.object({
  favoriteCategories: z.array(z.string()).default([]),
  preferredVenueTypes: z.array(z.string()).default([]),
  budgetPerVisit: z.string().optional(),
  defaultExploreFilters: z.array(z.string()).default(['all']),
  recommendationPreferences: z.object({
    enableAI: z.boolean().default(true),
    personalizedMenu: z.boolean().default(true),
  }),
});

export const AppSettingsSchema = z.object({
  appearance: z.enum(['light', 'dark', 'system']).default('light'),
  locationPermissionsGranted: z.boolean().default(true),
  searchRadiusKm: z.number().min(1).max(20).default(5),
  useLocationForJournals: z.boolean().default(true),
  distanceUnit: z.literal('km').default('km'),
  foodPreferences: FoodPreferencesSchema,
  lastBackupDate: z.string().optional(),
  appVersion: z.string().default('1.0.0'),
});

export type AppSettingsInput = z.infer<typeof AppSettingsSchema>;
