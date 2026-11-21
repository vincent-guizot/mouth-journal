import { Platform } from 'react-native';
import { osmConfig } from '../../config/env';
import { MainCategory, NearbyPlace } from '../../types/places';
import { OpenStreetMapPlacesAdapter } from './OpenStreetMapPlacesAdapter';

export { PlacesProviderError } from './OpenStreetMapPlacesAdapter';

/**
 * Thin facade over the OSM adapter. No mock fallback: failures propagate as
 * PlacesProviderError so screens can show an honest error state, and an empty
 * result is an empty list.
 */
export class PlacesService {
  constructor(private readonly adapter: OpenStreetMapPlacesAdapter) {}

  async searchNearby(
    lat: number,
    lon: number,
    radiusMeters: number = 3000,
    mainCategory: MainCategory = 'all',
    subCategory?: string
  ): Promise<NearbyPlace[]> {
    const results = await this.adapter.searchNearby({ latitude: lat, longitude: lon, radiusMeters, category: mainCategory });
    return subCategory && !subCategory.startsWith('all_') ? results.filter((p) => p.subCategory === subCategory) : results;
  }

  /** Server-side name search (Overpass regex on `name`), not a filter over a stale list. */
  searchPlaces(lat: number, lon: number, radiusMeters: number, query: string): Promise<NearbyPlace[]> {
    return this.adapter.searchNearby({ latitude: lat, longitude: lon, radiusMeters, category: 'all', keyword: query });
  }

  /** Manual (user-entered) places have no provider record: returns null, never throws for them. */
  async getPlaceDetails(placeId: string): Promise<NearbyPlace | null> {
    if (!placeId.startsWith('osm-')) return null;
    return this.adapter.getPlaceDetails(placeId);
  }

  reverseGeocode(lat: number, lon: number) {
    return this.adapter.reverseGeocode(lat, lon);
  }
}

export const placesService = new PlacesService(
  new OpenStreetMapPlacesAdapter({
    overpassUrl: osmConfig.overpassUrl,
    nominatimUrl: osmConfig.nominatimUrl,
    userAgent: osmConfig.userAgent,
    platform: Platform.OS === 'web' ? 'web' : 'native',
  })
);
