/** Pure category data (no icon imports) shared by the form builder and UI. */
export interface JournalCategoryDef {
  id: string;
  label: string;
  /** undefined = keep the place's own main category ("Lainnya"). */
  mainCategory?: 'food' | 'drinks' | 'wisata';
}

export const JOURNAL_CATEGORY_DEFS: JournalCategoryDef[] = [
  { id: 'kopi', label: 'Kopi/Cafe', mainCategory: 'drinks' },
  { id: 'restoran', label: 'Restoran', mainCategory: 'food' },
  { id: 'street_food', label: 'Street Food', mainCategory: 'food' },
  { id: 'dessert', label: 'Dessert', mainCategory: 'food' },
  { id: 'lainnya', label: 'Lainnya' },
];
