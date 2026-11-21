export interface MenuItemRow {
  id: string;
  name: string;
  price: number;
  /** undefined = not rated. Never defaulted to a fake 5. */
  rating?: number;
  /** Local or https photo of the dish, optional. */
  image?: string;
}

/** 0 = not rated yet. Submit is blocked until all four are 1..5. */
export interface ExperienceRatings {
  rasa: number;
  suasana: number;
  pelayanan: number;
  value: number;
}

export interface JournalPlaceSelection {
  /** Real OSM place id (osm-node-123) or a generated manual-… id. '' when nothing chosen. */
  id: string;
  providerId: 'osm' | 'manual';
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  mainCategory: 'food' | 'drinks' | 'wisata';
  subCategory?: string;
  subCategoryLabel?: string;
  photoUrl?: string;
}
