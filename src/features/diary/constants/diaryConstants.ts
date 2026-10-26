import {
  LayoutGrid,
  Coffee,
  Utensils,
  Sandwich,
  Cake,
} from 'lucide-react-native';

export type DiarySegment = 'timeline' | 'favorites';

export interface CategoryOption {
  id: string;
  label: string;
  icon: any;
}

export const DIARY_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'kopi', label: 'Kopi', icon: Coffee },
  { id: 'restoran', label: 'Restoran', icon: Utensils },
  { id: 'street_food', label: 'Street Food', icon: Sandwich },
  { id: 'dessert', label: 'Dessert', icon: Cake },
];
