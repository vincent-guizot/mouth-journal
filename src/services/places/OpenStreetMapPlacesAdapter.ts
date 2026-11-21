import { z } from 'zod';
import { IPlacesProvider, NearbySearchOptions } from './IPlacesProvider';
import { Place } from '../../models/place';
import { PlaceSchema } from '../../schemas/placeSchema';
import { HttpsUrlSchema } from '../../schemas/common';
import { calculateDistance } from '../../utils/geo';

export type PlacesErrorKind = 'timeout' | 'rate_limited' | 'http' | 'malformed' | 'network' | 'invalid_id' | 'upstream';

export class PlacesProviderError extends Error {
  constructor(
    readonly kind: PlacesErrorKind,
    message: string,
    readonly status?: number,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PlacesProviderError';
  }
}

// ---------------------------------------------------------------- response contracts

const OverpassTagsSchema = z.record(z.string(), z.string());

export const OverpassElementSchema = z
  .object({
    type: z.enum(['node', 'way', 'relation']),
    id: z.number().int().positive(),
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    center: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).optional(),
    tags: OverpassTagsSchema.optional(),
  })
  .loose();

export const OverpassResponseSchema = z
  .object({
    elements: z.array(z.unknown()),
    remark: z.string().optional(),
  })
  .loose();

export const NominatimReverseSchema = z.union([
  z.object({ display_name: z.string().min(1) }).loose(),
  z.object({ error: z.string() }).loose(),
]);

export type OverpassElement = z.infer<typeof OverpassElementSchema>;
export type OsmElementType = OverpassElement['type'];

// ---------------------------------------------------------------- ids

const PLACE_ID_PATTERN = /^osm-(node|way|relation)-(\d+)$/;
const LEGACY_PLACE_ID_PATTERN = /^osm-(\d+)$/;

export const toOsmPlaceId = (type: OsmElementType, id: number) => `osm-${type}-${id}`;

/** Parses `osm-way-123`. Legacy `osm-123` ids (created by older builds) were always nodes. */
export const parseOsmPlaceId = (placeId: string): { type: OsmElementType; id: number } => {
  const m = PLACE_ID_PATTERN.exec(placeId);
  if (m) return { type: m[1] as OsmElementType, id: Number(m[2]) };
  const legacy = LEGACY_PLACE_ID_PATTERN.exec(placeId);
  if (legacy) return { type: 'node', id: Number(legacy[1]) };
  throw new PlacesProviderError('invalid_id', `ID tempat OSM tidak valid: ${placeId}`);
};

/** Escapes a user keyword for use inside an Overpass regex string literal. */
export const escapeOverpassRegex = (input: string) =>
  Array.from(input)
    .map((c) => {
      // Two escaping layers: Overpass string literal ("…") then the regex itself.
      if (c === '"') return '\\"';
      if (c === '\\') return '\\\\\\\\';
      if ('.*+?^$()[]{}|'.includes(c)) return `\\\\${c}`;
      return c;
    })
    .join('');

// ---------------------------------------------------------------- categorisation

export const mapOsmCategories = (
  tags: Record<string, string>
): Pick<Place, 'mainCategory' | 'mainCategoryLabel' | 'subCategory' | 'subCategoryLabel'> => {
  if (tags.amenity === 'cafe') {
    return { mainCategory: 'drinks', mainCategoryLabel: 'MINUMAN & KOPI', subCategory: 'cafe', subCategoryLabel: 'Café & Coffee Shop' };
  }
  if (tags.amenity === 'bar' || tags.amenity === 'pub') {
    return { mainCategory: 'drinks', mainCategoryLabel: 'MINUMAN & KOPI', subCategory: 'bar', subCategoryLabel: 'Bar & Pub' };
  }
  if (tags.shop === 'bakery') {
    return { mainCategory: 'food', mainCategoryLabel: 'MAKANAN', subCategory: 'bakery', subCategoryLabel: 'Bakery & Pastry' };
  }
  if (tags.amenity === 'fast_food') {
    return { mainCategory: 'food', mainCategoryLabel: 'MAKANAN', subCategory: 'fast_food', subCategoryLabel: 'Fast Food' };
  }
  if (tags.amenity === 'food_court') {
    return { mainCategory: 'food', mainCategoryLabel: 'MAKANAN', subCategory: 'food_court', subCategoryLabel: 'Food Court' };
  }
  if (tags.tourism === 'museum' || tags.tourism === 'gallery') {
    return { mainCategory: 'wisata', mainCategoryLabel: 'WISATA & HANGOUT', subCategory: 'culture_museum', subCategoryLabel: 'Museum & Galeri' };
  }
  if (tags.leisure === 'park' || tags.leisure === 'garden') {
    return { mainCategory: 'wisata', mainCategoryLabel: 'WISATA & HANGOUT', subCategory: 'nature_park', subCategoryLabel: 'Taman' };
  }
  if (tags.tourism || tags.leisure) {
    return { mainCategory: 'wisata', mainCategoryLabel: 'WISATA & HANGOUT', subCategory: 'wisata', subCategoryLabel: 'Wisata & Spot Estetik' };
  }
  return { mainCategory: 'food', mainCategoryLabel: 'MAKANAN', subCategory: 'restaurant', subCategoryLabel: 'Restoran' };
};

const formatAddress = (tags: Record<string, string>): string => {
  const street = tags['addr:street'];
  const number = tags['addr:housenumber'];
  const line1 = street ? (number ? `${street} No. ${number}` : street) : '';
  return [line1, tags['addr:suburb'], tags['addr:city']].filter(Boolean).join(', ');
};

const httpsOrUndefined = (value: string | undefined) => {
  if (!value) return undefined;
  return HttpsUrlSchema.safeParse(value).success ? value : undefined;
};

/**
 * Converts a validated Overpass element to a Place. Returns null when the element is
 * not a usable place (no name, no coordinates) or fails PlaceSchema. Never invents
 * ratings, addresses or coordinates.
 */
export const overpassElementToPlace = (
  raw: unknown,
  origin?: { latitude: number; longitude: number },
  retrievedAt: string = new Date().toISOString()
): Place | null => {
  const parsed = OverpassElementSchema.safeParse(raw);
  if (!parsed.success) return null;
  const el = parsed.data;
  const tags = el.tags ?? {};
  const name = tags.name || tags['name:id'] || tags['name:en'] || tags.brand;
  if (!name) return null;
  const latitude = el.type === 'node' ? el.lat : el.center?.lat;
  const longitude = el.type === 'node' ? el.lon : el.center?.lon;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  const candidate = {
    id: toOsmPlaceId(el.type, el.id),
    providerId: 'osm' as const,
    osmType: el.type,
    osmId: el.id,
    name,
    address: formatAddress(tags),
    ...mapOsmCategories(tags),
    latitude,
    longitude,
    ...(origin && { distanceMeter: calculateDistance(origin.latitude, origin.longitude, latitude, longitude) }),
    openingHours: tags.opening_hours,
    phone: tags.phone || tags['contact:phone'],
    website: httpsOrUndefined(tags.website || tags['contact:website']),
    cuisine: tags.cuisine,
    tags: [],
    retrievedAt,
  };
  const result = PlaceSchema.safeParse(candidate);
  return result.success ? result.data : null;
};

// ---------------------------------------------------------------- adapter

export interface OsmAdapterOptions {
  overpassUrl: string;
  nominatimUrl: string;
  userAgent: string;
  /** Browsers forbid setting User-Agent; it is only sent on native. */
  platform: 'web' | 'native';
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

const CATEGORY_FILTERS: Record<NonNullable<NearbySearchOptions['category']>, string[]> = {
  food: ['["amenity"~"^(restaurant|fast_food|food_court)$"]', '["shop"="bakery"]'],
  drinks: ['["amenity"~"^(cafe|bar|pub)$"]'],
  wisata: ['["tourism"~"^(attraction|museum|viewpoint|gallery|theme_park)$"]', '["leisure"~"^(park|garden)$"]'],
  all: [
    '["amenity"~"^(cafe|restaurant|fast_food|food_court|bar)$"]',
    '["tourism"~"^(attraction|museum|viewpoint)$"]',
    '["leisure"="park"]',
    '["shop"="bakery"]',
  ],
};

export class OpenStreetMapPlacesAdapter implements IPlacesProvider {
  readonly providerId = 'osm';
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(private readonly options: OsmAdapterOptions) {
    this.timeoutMs = options.timeoutMs ?? 12_000;
    this.fetchFn = options.fetchFn ?? ((...args) => fetch(...args));
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Accept: 'application/json',
      ...(this.options.platform === 'native' && { 'User-Agent': this.options.userAgent }),
      ...extra,
    };
  }

  /** fetch + timeout + status mapping + JSON parsing. Every failure is a PlacesProviderError. */
  private async requestJson(url: string, init: RequestInit, label: string): Promise<unknown> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new PlacesProviderError('timeout', `${label} timeout setelah ${this.timeoutMs} ms`));
      }, this.timeoutMs);
    });
    try {
      const response = await Promise.race([this.fetchFn(url, { ...init, signal: controller.signal }), timeout]);
      if (response.status === 429) {
        throw new PlacesProviderError('rate_limited', `${label}: terlalu banyak permintaan (HTTP 429). Coba lagi sebentar.`, 429);
      }
      if (response.status === 504) {
        throw new PlacesProviderError('timeout', `${label}: server timeout (HTTP 504).`, 504);
      }
      if (!response.ok) {
        throw new PlacesProviderError('http', `${label}: HTTP ${response.status}`, response.status);
      }
      const text = await Promise.race([response.text(), timeout]);
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new PlacesProviderError('malformed', `${label}: respons bukan JSON yang valid.`, response.status, err);
      }
    } catch (err) {
      if (err instanceof PlacesProviderError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new PlacesProviderError('timeout', `${label} timeout setelah ${this.timeoutMs} ms`, undefined, err);
      }
      throw new PlacesProviderError('network', `${label}: koneksi gagal (${err instanceof Error ? err.message : String(err)}).`, undefined, err);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private async overpass(query: string): Promise<unknown[]> {
    const json = await this.requestJson(
      this.options.overpassUrl,
      {
        method: 'POST',
        headers: this.headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }),
        body: `data=${encodeURIComponent(query)}`,
      },
      'Overpass'
    );
    const parsed = OverpassResponseSchema.safeParse(json);
    if (!parsed.success) throw new PlacesProviderError('malformed', 'Overpass: struktur respons tidak memiliki "elements".');
    // Overpass reports query timeouts/memory errors as HTTP 200 + remark.
    if (parsed.data.remark && /error|timed out/i.test(parsed.data.remark)) {
      throw new PlacesProviderError('upstream', `Overpass: ${parsed.data.remark}`);
    }
    return parsed.data.elements;
  }

  buildSearchQuery(options: NearbySearchOptions): string {
    const { latitude, longitude, category = 'all', keyword, limit = 50 } = options;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new PlacesProviderError('invalid_id', 'Koordinat pencarian tidak valid.');
    }
    const radius = Math.round(Math.min(20_000, Math.max(100, options.radiusMeters ?? 3000)));
    const around = `(around:${radius},${latitude},${longitude})`;
    const nameFilter = keyword?.trim() ? `["name"~"${escapeOverpassRegex(keyword.trim())}",i]` : '';
    const statements = CATEGORY_FILTERS[category].map((f) => `nwr${f}${nameFilter}${around};`).join('\n');
    return `[out:json][timeout:15];\n(\n${statements}\n);\nout center tags ${Math.max(1, Math.min(200, limit))};`;
  }

  async searchNearby(options: NearbySearchOptions): Promise<Place[]> {
    const elements = await this.overpass(this.buildSearchQuery(options));
    const origin = { latitude: options.latitude, longitude: options.longitude };
    const retrievedAt = new Date().toISOString();
    const places: Place[] = [];
    for (const el of elements) {
      const place = overpassElementToPlace(el, origin, retrievedAt);
      if (place) places.push(place);
    }
    return places.sort((a, b) => (a.distanceMeter ?? 0) - (b.distanceMeter ?? 0));
  }

  /** Supports node, way and relation IDs (osm-{type}-{id}). */
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    const { type, id } = parseOsmPlaceId(placeId);
    const elements = await this.overpass(`[out:json][timeout:15];\n${type}(${id});\nout center tags;`);
    for (const el of elements) {
      const place = overpassElementToPlace(el);
      if (place && place.id === toOsmPlaceId(type, id)) return place;
    }
    return null;
  }

  /** Nominatim reverse geocoding. null = Nominatim found no address; errors throw. */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new PlacesProviderError('invalid_id', 'Koordinat tidak valid.');
    }
    const params = [
      ['format', 'jsonv2'],
      ['lat', String(latitude)],
      ['lon', String(longitude)],
    ]
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const json = await this.requestJson(
      `${this.options.nominatimUrl.replace(/\/+$/, '')}/reverse?${params}`,
      { method: 'GET', headers: this.headers({ 'Accept-Language': 'id,en' }) },
      'Nominatim'
    );
    const parsed = NominatimReverseSchema.safeParse(json);
    if (!parsed.success) throw new PlacesProviderError('malformed', 'Nominatim: respons tidak memiliki display_name.');
    const data = parsed.data as { display_name?: unknown };
    return typeof data.display_name === 'string' ? data.display_name : null;
  }
}
