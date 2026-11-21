/**
 * Legacy aliases. The canonical types live in src/models and are derived from the
 * Zod schemas in src/schemas.
 */
export type { Journal as DiaryEntry, CriteriaRating, MenuItem } from '../models/journal';
export type { WishlistItem } from '../models/wishlist';

export interface CulinaryStats {
  totalVisits: number;
  totalSpent: number;
  totalPlaces: number;
  favoriteCategory: string | null;
  averageRating: number | null;
  foodCount: number;
  drinksCount: number;
  wisataCount: number;
}
