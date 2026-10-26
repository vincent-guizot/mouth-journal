import { IPlacesProvider, NearbySearchOptions } from './IPlacesProvider';
import { Place } from '../../models/place';
import { PlaceSchema } from '../../schemas/placeSchema';
import { calculateDistance } from '../../utils/geo';

export class OpenStreetMapPlacesAdapter implements IPlacesProvider {
  readonly providerId = 'osm';

  private overpassUrl =
    process.env.EXPO_PUBLIC_OSM_OVERPASS_URL ||
    'https://overpass-api.de/api/interpreter';

  private nominatimUrl =
    process.env.EXPO_PUBLIC_OSM_NOMINATIM_URL ||
    'https://nominatim.openstreetmap.org';

  private userAgent = 'MouthJournal-MobileApp/1.0.0 (contact@mouthjournal.app)';

  /**
   * Pencarian tempat kuliner terdekat melalui Overpass API OSM
   */
  async searchNearby(options: NearbySearchOptions): Promise<Place[]> {
    const {
      latitude,
      longitude,
      radiusMeters = 3000,
      category = 'all',
      limit = 35,
    } = options;

    let filterQuery = '';

    if (category === 'food') {
      filterQuery = `
        node["amenity"~"restaurant|fast_food|food_court"](around:${radiusMeters}, ${latitude}, ${longitude});
        node["shop"="bakery"](around:${radiusMeters}, ${latitude}, ${longitude});
      `;
    } else if (category === 'drinks') {
      filterQuery = `
        node["amenity"~"cafe|bar|pub"](around:${radiusMeters}, ${latitude}, ${longitude});
      `;
    } else if (category === 'wisata') {
      filterQuery = `
        node["tourism"~"attraction|museum|viewpoint|gallery|theme_park"](around:${radiusMeters}, ${latitude}, ${longitude});
        node["leisure"~"park|garden"](around:${radiusMeters}, ${latitude}, ${longitude});
      `;
    } else {
      filterQuery = `
        node["amenity"~"cafe|restaurant|fast_food|bar"](around:${radiusMeters}, ${latitude}, ${longitude});
        node["tourism"~"attraction|museum|viewpoint"](around:${radiusMeters}, ${latitude}, ${longitude});
        node["leisure"="park"](around:${radiusMeters}, ${latitude}, ${longitude});
        node["shop"="bakery"](around:${radiusMeters}, ${latitude}, ${longitude});
      `;
    }

    const overpassQuery = `
      [out:json][timeout:10];
      (
        ${filterQuery}
      );
      out body ${limit};
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `${this.overpassUrl}?data=${encodeURIComponent(overpassQuery)}`,
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': this.userAgent,
          },
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSM Overpass API error HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.elements || !Array.isArray(data.elements)) {
        return [];
      }

      const places: Place[] = [];

      for (const el of data.elements) {
        if (!el.tags) continue;
        const name =
          el.tags.name ||
          el.tags['name:en'] ||
          el.tags['name:id'] ||
          el.tags.brand;
        if (!name) continue;

        const categorization = this.mapOsmCategories(el.tags);
        const distance = calculateDistance(
          latitude,
          longitude,
          el.lat,
          el.lon
        );

        const addressParts = [
          el.tags['addr:street'],
          el.tags['addr:housenumber'],
          el.tags['addr:city'],
        ].filter(Boolean);

        const address =
          addressParts.length > 0
            ? addressParts.join(' No. ')
            : el.tags.cuisine
            ? `Kuliner: ${el.tags.cuisine}`
            : 'Kawasan Sekitar';

        const rawPlace: Place = {
          id: `osm-${el.id}`,
          providerId: 'osm',
          osmId: el.id,
          name,
          address,
          mainCategory: categorization.mainCategory,
          mainCategoryLabel: categorization.mainCategoryLabel,
          subCategory: categorization.subCategory,
          subCategoryLabel: categorization.subCategoryLabel,
          latitude: el.lat,
          longitude: el.lon,
          distanceMeter: distance,
          openingHours: el.tags.opening_hours,
          phone: el.tags.phone || el.tags['contact:phone'],
          cuisine: el.tags.cuisine,
          retrievedAt: new Date().toISOString(),
        };

        const validated = PlaceSchema.safeParse(rawPlace);
        if (validated.success) {
          places.push(validated.data as Place);
        }
      }

      // Urutkan berdasarkan jarak terdekat
      return places.sort(
        (a, b) => (a.distanceMeter || 0) - (b.distanceMeter || 0)
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn('[OpenStreetMapPlacesAdapter] Permintaan Overpass timeout (8s).');
      } else {
        console.warn('[OpenStreetMapPlacesAdapter] Gagal mengambil data:', err);
      }
      return [];
    }
  }

  /**
   * Detail tempat dari OSM
   */
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    const numericId = placeId.replace('osm-', '');
    const query = `[out:json];node(${numericId});out body;`;

    try {
      const response = await fetch(
        `${this.overpassUrl}?data=${encodeURIComponent(query)}`,
        {
          headers: { 'User-Agent': this.userAgent },
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.elements || data.elements.length === 0) return null;

      const el = data.elements[0];
      const categorization = this.mapOsmCategories(el.tags || {});

      return {
        id: `osm-${el.id}`,
        providerId: 'osm',
        osmId: el.id,
        name: el.tags.name || 'Tempat Kuliner',
        address: el.tags['addr:street'] || 'Kawasan Sekitar',
        mainCategory: categorization.mainCategory,
        mainCategoryLabel: categorization.mainCategoryLabel,
        subCategory: categorization.subCategory,
        subCategoryLabel: categorization.subCategoryLabel,
        latitude: el.lat,
        longitude: el.lon,
        openingHours: el.tags.opening_hours,
        phone: el.tags.phone,
        cuisine: el.tags.cuisine,
      };
    } catch {
      return null;
    }
  }

  /**
   * Reverse Geocode via Nominatim
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const url = `${this.nominatimUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  }

  private mapOsmCategories(tags: Record<string, string>): {
    mainCategory: 'food' | 'drinks' | 'wisata';
    mainCategoryLabel: string;
    subCategory: string;
    subCategoryLabel: string;
  } {
    if (tags.amenity === 'cafe') {
      return {
        mainCategory: 'drinks',
        mainCategoryLabel: 'MINUMAN & KOPI',
        subCategory: 'cafe',
        subCategoryLabel: 'Café & Coffee Shop',
      };
    }
    if (tags.shop === 'bakery') {
      return {
        mainCategory: 'food',
        mainCategoryLabel: 'MAKANAN',
        subCategory: 'bakery',
        subCategoryLabel: 'Bakery & Pastry',
      };
    }
    if (tags.amenity === 'fast_food') {
      return {
        mainCategory: 'food',
        mainCategoryLabel: 'MAKANAN',
        subCategory: 'fast_food',
        subCategoryLabel: 'Fast Food',
      };
    }
    if (tags.tourism || tags.leisure) {
      return {
        mainCategory: 'wisata',
        mainCategoryLabel: 'WISATA & HANGOUT',
        subCategory: 'wisata',
        subCategoryLabel: 'Wisata & Spot Estetik',
      };
    }
    return {
      mainCategory: 'food',
      mainCategoryLabel: 'MAKANAN',
      subCategory: 'restaurant',
      subCategoryLabel: 'Restoran',
    };
  }
}
