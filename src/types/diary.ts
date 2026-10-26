import { MainCategory } from './places';

export interface CriteriaRating {
  taste: number;      // 1-5 (Rasa untuk Makanan/Minuman, atau Pengalaman/Keseruan untuk Wisata)
  ambiance: number;   // 1-5 (Suasana / Spot Estetik)
  service: number;    // 1-5 (Pelayanan / Fasilitas)
  price: number;      // 1-5 (Kesesuaian Harga / Value Tiket)
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: 'food' | 'drink' | 'dessert' | 'snack' | 'ticket' | 'other';
  isRecommended?: boolean;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
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
  isPublic: boolean;
  visitedAt: string; // ISO date string
  createdAt: string; // ISO date string
  likesCount?: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  placeName: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  subCategory: string;
  subCategoryLabel: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  targetDate?: string;
  createdAt: string;
}

export interface CulinaryStats {
  totalVisits: number;
  totalSpent: number;
  totalPlaces: number;
  favoriteCategory: string;
  averageRating: number;
  foodCount: number;
  drinksCount: number;
  wisataCount: number;
}
