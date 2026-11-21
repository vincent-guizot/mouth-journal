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

export type { Place as NearbyPlace, UserLocation } from '../models/place';
