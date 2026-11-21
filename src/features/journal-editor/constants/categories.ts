import {
  Coffee,
  Utensils,
  Sandwich,
  Cake,
  MoreHorizontal,
} from 'lucide-react-native';
import { JOURNAL_CATEGORY_DEFS } from './categoryDefs';

export interface CategoryItem {
  id: string;
  label: string;
  icon: any;
}

const ICONS: Record<string, CategoryItem['icon']> = {
  kopi: Coffee,
  restoran: Utensils,
  street_food: Sandwich,
  dessert: Cake,
  lainnya: MoreHorizontal,
};

export const JOURNAL_CATEGORIES: CategoryItem[] = JOURNAL_CATEGORY_DEFS.map((c) => ({
  id: c.id,
  label: c.label,
  icon: ICONS[c.id],
}));

export const CRITERIA_CRITERIA_LIST = [
  { key: 'rasa', label: 'Rasa' },
  { key: 'suasana', label: 'Suasana' },
  { key: 'pelayanan', label: 'Pelayanan' },
  { key: 'value', label: 'Value for Money' },
] as const;
