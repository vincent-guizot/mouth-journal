import { Place } from '../../models/place';

export interface NearbySearchOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  category?: 'all' | 'food' | 'drinks' | 'wisata';
  keyword?: string;
  limit?: number;
}

export interface IPlacesProvider {
  /**
   * Nama identifier provider (e.g., 'osm', 'google', 'here')
   */
  readonly providerId: string;

  /**
   * Mencari tempat di sekitar koordinat
   */
  searchNearby(options: NearbySearchOptions): Promise<Place[]>;

  /**
   * Mengambil detail tempat berdasarkan ID provider
   */
  getPlaceDetails(placeId: string): Promise<Place | null>;

  /**
   * Reverse geocoding koordinat menjadi alamat
   */
  reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
}
