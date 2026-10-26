export type MainCategory = 'all' | 'food' | 'drinks' | 'wisata';

export type FoodSubCategory = 
  | 'all_food'
  | 'restaurant' 
  | 'street_food' 
  | 'nusantara' 
  | 'bakery' 
  | 'dessert' 
  | 'fast_food';

export type DrinksSubCategory = 
  | 'all_drinks'
  | 'cafe' 
  | 'tea' 
  | 'boba_juice' 
  | 'bar';

export type WisataSubCategory = 
  | 'all_wisata'
  | 'nature_park' 
  | 'culture_museum' 
  | 'photo_hangout' 
  | 'entertainment' 
  | 'market';

export type SubCategory = FoodSubCategory | DrinksSubCategory | WisataSubCategory | string;

export interface SubCategoryItem {
  id: string;
  label: string;
  emoji: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  mainCategoryLabel: string;
  subCategory: string;
  subCategoryLabel: string;
  latitude: number;
  longitude: number;
  address?: string;
  distanceMeter?: number;
  openingHours?: string;
  phone?: string;
  cuisine?: string;
  osmId?: string | number;
  userVisitedCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  tags?: string[];
  isAutoRecommended?: boolean;
  recommendationReason?: string;
  photoUrl?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  district?: string;
}

export interface IPlacesService {
  searchNearby(
    lat: number, 
    lon: number, 
    radiusMeters?: number, 
    mainCategory?: MainCategory,
    subCategory?: string
  ): Promise<NearbyPlace[]>;
  getAutoRecommendations(
    lat: number,
    lon: number,
    radiusMeters?: number
  ): Promise<NearbyPlace[]>;
  getPlaceDetails(placeId: string): Promise<NearbyPlace | null>;
}
