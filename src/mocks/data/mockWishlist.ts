import { WishlistItem } from '../../models/wishlist';

export interface WishlistCardItem {
  id: string;
  name: string;
  address: string;
  categoryLabel: string;
  categoryIcon: string;
  rating: number;
  reviewCount: string;
  distance: string;
  description: string;
  image: string;
  mainCategory: 'food' | 'drinks' | 'wisata';
  subCategory: string;
  latitude: number;
  longitude: number;
}

export interface WishlistMenuItem {
  id: string;
  name: string;
  placeName: string;
  price: string;
  image: string;
  notes: string;
}

export const MOCK_WISHLIST_PLACES: WishlistCardItem[] = [
  {
    id: 'wish-1',
    name: 'Tanamera Coffee Roastery',
    address: 'Senopati, Jakarta Selatan',
    categoryLabel: 'Kopi/Cafe',
    categoryIcon: '☕',
    rating: 4.2,
    reviewCount: '1.2K',
    distance: '1.3 km',
    description: 'Salah satu specialty coffee terbaik di Jakarta dengan suasana yang nyaman dan estetik.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'drinks',
    subCategory: 'cafe',
    latitude: -6.229746,
    longitude: 106.816431,
  },
  {
    id: 'wish-2',
    name: 'Kyō Dessert Bar',
    address: 'Pik, Jakarta Utara',
    categoryLabel: 'Dessert',
    categoryIcon: '🍰',
    rating: 4.5,
    reviewCount: '642',
    distance: '8.7 km',
    description: 'Tempat dessert dengan kreasi unik dan suasana instagramable.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'food',
    subCategory: 'dessert',
    latitude: -6.1132,
    longitude: 106.741,
  },
  {
    id: 'wish-3',
    name: 'Twin House',
    address: 'Kemang, Jakarta Selatan',
    categoryLabel: 'Restoran',
    categoryIcon: '🍽️',
    rating: 4.6,
    reviewCount: '518',
    distance: '6.1 km',
    description: 'Restoran dengan konsep rumah yang cozy dan menu fusion yang menarik.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'food',
    subCategory: 'restaurant',
    latitude: -6.2731,
    longitude: 106.8162,
  },
  {
    id: 'wish-4',
    name: 'Titik Temu Coffee',
    address: 'Blok M, Jakarta Selatan',
    categoryLabel: 'Kopi/Cafe',
    categoryIcon: '☕',
    rating: 4.3,
    reviewCount: '320',
    distance: '4.8 km',
    description: 'Kopi enak, tempat nyaman, cocok untuk kerja.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'drinks',
    subCategory: 'cafe',
    latitude: -6.2441,
    longitude: 106.7985,
  },
  {
    id: 'wish-5',
    name: 'Pizzeria Cavalese',
    address: 'Menteng, Jakarta Pusat',
    categoryLabel: 'Street Food',
    categoryIcon: '🍕',
    rating: 5.0,
    reviewCount: '856',
    distance: '3.9 km',
    description: 'Pizza autentik dengan bahan premium dan rasa italian yang khas.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'food',
    subCategory: 'street_food',
    latitude: -6.195,
    longitude: 106.832,
  },
  {
    id: 'wish-6',
    name: 'Toko Kopi Tuku',
    address: 'Cipete, Jakarta Selatan',
    categoryLabel: 'Kopi/Cafe',
    categoryIcon: '☕',
    rating: 4.4,
    reviewCount: '1.1K',
    distance: '5.6 km',
    description: 'Kopi lokal dengan cita rasa khas dan suasana santai.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
    mainCategory: 'drinks',
    subCategory: 'cafe',
    latitude: -6.2785,
    longitude: 106.8012,
  },
];

export const MOCK_WISHLIST_MENUS: WishlistMenuItem[] = [
  {
    id: 'mw-1',
    name: 'Signature Cold Brew',
    placeName: 'Tanamera Coffee Roastery',
    price: 'Rp 45.000',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80',
    notes: 'Mau coba cold brew concentrate yang katanya harum banget.',
  },
  {
    id: 'mw-2',
    name: 'Souffle Pancake Strawberry',
    placeName: 'Kyō Dessert Bar',
    price: 'Rp 65.000',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    notes: 'Pancake fluffy lumer di mulut.',
  },
  {
    id: 'mw-3',
    name: 'Quattro Formaggi Pizza',
    placeName: 'Pizzeria Cavalese',
    price: 'Rp 115.000',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80',
    notes: 'Kombinasi 4 keju leleh ala Napoli.',
  },
  {
    id: 'mw-4',
    name: 'Es Kopi Susu Tetangga',
    placeName: 'Toko Kopi Tuku',
    price: 'Rp 20.000',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
    notes: 'Kopi susu gula aren legendaris.',
  },
];

export const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-1',
    userId: 'user-demo-1',
    placeId: 'osm-wisata-taman-literasi',
    placeName: 'Taman Literasi Martha Christina Tiahahu',
    mainCategory: 'wisata',
    subCategory: 'nature_park',
    placeAddress: 'Kawasan Blok M Hub, Kebayoran Baru, Jakarta Selatan',
    latitude: -6.2441,
    longitude: 106.7985,
    ratingAverage: 4.7,
    personalNotes: 'Mau baca buku di perpustakaan tamannya dan jalan santai sore.',
    photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-24T10:00:00.000Z',
  },
  {
    id: 'wish-2',
    userId: 'user-demo-1',
    placeId: 'osm-food-gultik',
    placeName: 'Gultik Blok M Asli',
    mainCategory: 'food',
    subCategory: 'street_food',
    placeAddress: 'Kawasan Bulungan, Blok M, Jakarta Selatan',
    latitude: -6.2425,
    longitude: 106.7981,
    ratingAverage: 4.5,
    personalNotes: 'Cari makan malam weekend bareng teman-teman setelah jalan di Blok M.',
    photoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-22T18:00:00.000Z',
  },
  {
    id: 'wish-3',
    userId: 'user-demo-1',
    placeId: 'osm-drinks-manual-brew',
    placeName: 'Giyanti Coffee Roastery',
    mainCategory: 'drinks',
    subCategory: 'cafe',
    placeAddress: 'Jl. Surabaya No. 20, Menteng, Jakarta Pusat',
    latitude: -6.1989,
    longitude: 106.8415,
    ratingAverage: 4.9,
    personalNotes: 'Coba single origin pour-over dan apple pie legendaris mereka.',
    photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-21T14:00:00.000Z',
  },
];
