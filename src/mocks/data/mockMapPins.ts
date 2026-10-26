export interface MapPinData {
  id: string;
  name: string;
  address: string;
  rating: number;
  ratingCount: string;
  category: string;
  photoUrl: string;
  coords: { top: number; left: number };
  miniPhotos: string[];
}

export const MOCK_MAP_PINS: MapPinData[] = [
  {
    id: 'pin-zona-nyaman',
    name: 'Zona Nyaman Coffee',
    address: 'Kemanggisan, Jakarta Barat',
    rating: 5.0,
    ratingCount: '(1.5K)',
    category: 'Kopi/Cafe',
    photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
    coords: { top: 290, left: 140 },
    miniPhotos: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'pin-latte',
    name: 'Tanamera Coffee Roastery',
    address: 'Senopati, Jakarta Selatan',
    rating: 4.8,
    ratingCount: '(1.2K)',
    category: 'Kopi/Cafe',
    photoUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
    coords: { top: 70, left: 55 },
    miniPhotos: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'pin-ramen',
    name: 'Kyoto Ramen Bar',
    address: 'Jl. Suryo, Senopati, Jakarta Selatan',
    rating: 4.6,
    ratingCount: '(890)',
    category: 'Restoran',
    photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    coords: { top: 120, left: 240 },
    miniPhotos: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'pin-dessert',
    name: 'Kyō Dessert Bar',
    address: 'PIK, Jakarta Utara',
    rating: 4.7,
    ratingCount: '(640)',
    category: 'Dessert',
    photoUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    coords: { top: 220, left: 70 },
    miniPhotos: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'pin-taman',
    name: 'Hutan Kota GBK',
    address: 'Senayan, Jakarta Pusat',
    rating: 4.9,
    ratingCount: '(2.1K)',
    category: 'Wisata',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    coords: { top: 380, left: 220 },
    miniPhotos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    ],
  },
];
