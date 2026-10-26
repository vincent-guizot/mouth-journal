/**
 * 🔖 Wishlist Domain Model
 */

export interface WishlistItem {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  placeAddress: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  subCategory: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  ratingAverage?: number;
  personalNotes?: string;
  createdAt: string; // ISO 8601 Date
}
