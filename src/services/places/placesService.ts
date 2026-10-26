import { IPlacesService, NearbyPlace, MainCategory } from '../../types/places';
import { OpenStreetMapPlacesAdapter } from './OpenStreetMapPlacesAdapter';
import { MOCK_PLACES } from '../../mocks/data/mockPlaces';

export class OpenStreetMapService implements IPlacesService {
  private adapter = new OpenStreetMapPlacesAdapter();

  async searchNearby(
    lat: number,
    lon: number,
    radiusMeters: number = 3000,
    mainCategory: MainCategory = 'all',
    subCategory?: string
  ): Promise<NearbyPlace[]> {
    try {
      const results = await this.adapter.searchNearby({
        latitude: lat,
        longitude: lon,
        radiusMeters,
        category: mainCategory,
      });

      if (results.length > 0) {
        if (subCategory && !subCategory.startsWith('all_')) {
          return results.filter((p) => p.subCategory === subCategory);
        }
        return results;
      }

      // Fallback lokal jika di mode pengembangan dan OSM kosong/gagal
      if (__DEV__) {
        return this.getFallbackPlaces(mainCategory, subCategory);
      }
      return [];
    } catch (error) {
      console.warn('[OpenStreetMapService] Error searchNearby:', error);
      return __DEV__ ? this.getFallbackPlaces(mainCategory, subCategory) : [];
    }
  }

  async getAutoRecommendations(
    lat: number,
    lon: number,
    radiusMeters: number = 2500
  ): Promise<NearbyPlace[]> {
    const places = await this.searchNearby(lat, lon, radiusMeters, 'all');
    return places.slice(0, 5);
  }

  async getPlaceDetails(placeId: string): Promise<NearbyPlace | null> {
    return this.adapter.getPlaceDetails(placeId);
  }

  async searchPlaces(
    lat: number,
    lon: number,
    radiusMeters: number = 3000,
    query?: string
  ): Promise<NearbyPlace[]> {
    const places = await this.searchNearby(lat, lon, radiusMeters, 'all');
    if (!query) return places;
    const q = query.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.address ? p.address.toLowerCase().includes(q) : false) ||
        p.subCategory.toLowerCase().includes(q)
    );
  }

  private getFallbackPlaces(
    mainCategory: MainCategory = 'all',
    subCategory?: string
  ): NearbyPlace[] {
    let filtered: NearbyPlace[] = MOCK_PLACES;
    if (mainCategory !== 'all') {
      filtered = filtered.filter((p) => p.mainCategory === mainCategory);
    }
    if (subCategory && !subCategory.startsWith('all_')) {
      filtered = filtered.filter((p) => p.subCategory === subCategory);
    }
    return filtered;
  }
}

export const placesService = new OpenStreetMapService();

