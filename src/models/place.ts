/**
 * 🗺️ Place & Geocoding Domain Models
 */

export interface Place {
  id: string;
  providerId: 'osm' | 'manual';
  osmId?: string | number;
  name: string;
  address: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  mainCategoryLabel: string;
  subCategory: string;
  subCategoryLabel: string;
  latitude: number;
  longitude: number;
  phone?: string;
  openingHours?: string;
  cuisine?: string;
  distanceMeter?: number;
  photoUrl?: string;
  tags?: string[];
  ratingAverage?: number;
  ratingCount?: number;
  retrievedAt?: string; // ISO 8601
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  district?: string;
}

// Backward compatibility alias
export type NearbyPlace = Place;
