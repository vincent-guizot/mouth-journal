import {
  Coffee,
  Utensils,
  Sandwich,
  Cake,
  MoreHorizontal,
} from 'lucide-react-native';

export interface CategoryItem {
  id: string;
  label: string;
  icon: any;
}

export const JOURNAL_CATEGORIES: CategoryItem[] = [
  { id: 'kopi', label: 'Kopi/Cafe', icon: Coffee },
  { id: 'restoran', label: 'Restoran', icon: Utensils },
  { id: 'street_food', label: 'Street Food', icon: Sandwich },
  { id: 'dessert', label: 'Dessert', icon: Cake },
  { id: 'lainnya', label: 'Lainnya', icon: MoreHorizontal },
];

export const CRITERIA_CRITERIA_LIST = [
  { key: 'rasa', label: 'Rasa' },
  { key: 'suasana', label: 'Suasana' },
  { key: 'pelayanan', label: 'Pelayanan' },
  { key: 'value', label: 'Value for Money' },
] as const;
