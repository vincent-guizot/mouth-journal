/**
 * ⚙️ User Preferences & Settings Domain Models
 */

export interface FoodPreferences {
  favoriteCategories: string[];
  preferredVenueTypes: string[];
  budgetPerVisit?: string;
  defaultExploreFilters?: string[];
  recommendationPreferences: {
    enableAI: boolean;
    personalizedMenu: boolean;
  };
}

export interface AppSettings {
  // Appearance (Light, Dark, System)
  appearance: 'light' | 'dark' | 'system';
  
  // Location & Maps (Km only)
  locationPermissionsGranted: boolean;
  searchRadiusKm: number;
  useLocationForJournals: boolean;
  distanceUnit: 'km';

  // Food Preferences
  foodPreferences: FoodPreferences;

  // Account & Metadata
  lastBackupDate?: string;
  appVersion: string;
}

export const DEFAULT_FOOD_PREFERENCES: FoodPreferences = {
  favoriteCategories: ['Kopi/Cafe', 'Restoran', 'Bakery'],
  preferredVenueTypes: ['Café', 'Bakery', 'Hidden Gem'],
  budgetPerVisit: 'Rp 50.000 - 100.000',
  defaultExploreFilters: ['all'],
  recommendationPreferences: {
    enableAI: true,
    personalizedMenu: true,
  },
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appearance: 'light',
  locationPermissionsGranted: true,
  searchRadiusKm: 5,
  useLocationForJournals: true,
  distanceUnit: 'km',
  foodPreferences: DEFAULT_FOOD_PREFERENCES,
  appVersion: '1.0.0',
};
