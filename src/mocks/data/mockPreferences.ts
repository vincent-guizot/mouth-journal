import { AppSettings, DEFAULT_APP_SETTINGS } from '../../models/preferences';

export const MOCK_APP_SETTINGS: AppSettings = {
  ...DEFAULT_APP_SETTINGS,
  foodPreferences: {
    favoriteCategories: ['Kopi/Cafe', 'Restoran', 'Bakery', 'Wisata Alam'],
    preferredVenueTypes: ['Café', 'Bakery', 'Hidden Gem', 'Outdoor'],
    budgetPerVisit: 'Rp 50.000 - 100.000',
    defaultExploreFilters: ['all'],
    recommendationPreferences: {
      enableAI: true,
      personalizedMenu: true,
    },
  },
};
