/**
 * 📖 Journal & Review Domain Models
 */

export interface CriteriaRating {
  taste: number;      // Rasa (1-5)
  ambiance: number;   // Suasana (1-5)
  service: number;    // Pelayanan (1-5)
  price: number;      // Kesesuaian Harga / Value for Money (1-5)
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: 'food' | 'drink' | 'dessert' | 'snack';
  rating?: number;
  isRecommended?: boolean;
  photoUrl?: string;
  notes?: string;
}

export interface Journal {
  id: string;
  userId: string;
  userName?: string;
  placeId: string;
  placeName: string;
  placeAddress: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  subCategory: string;
  subCategoryLabel: string;
  latitude: number;
  longitude: number;
  photoUrls: string[];
  overallRating: number;
  criteriaRating: CriteriaRating;
  menuItems: MenuItem[];
  totalSpent: number;
  reviewText: string;
  tags: string[];
  visitedAt: string; // ISO 8601 Date
  createdAt: string; // ISO 8601 Date
  updatedAt?: string; // ISO 8601 Date
}

// Alias for backward compatibility with DiaryEntry
export type DiaryEntry = Journal;
