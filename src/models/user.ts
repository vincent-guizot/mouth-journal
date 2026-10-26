/**
 * 👤 User Profile Domain Model
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  phoneNumber?: string;
  bio?: string;
  photoURL?: string;
  bannerURL?: string;
  culinaryPreferences?: string[];
  favoriteVenueTypes?: string[];
  budgetPerVisit?: string;
  favoriteLocations?: string[];
  socialInstagram?: string;
  socialTikTok?: string;
  createdAt?: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}
