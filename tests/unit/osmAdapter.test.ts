import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OpenStreetMapPlacesAdapter,
  PlacesProviderError,
  escapeOverpassRegex,
  parseOsmPlaceId,
} from '../../src/services/places/OpenStreetMapPlacesAdapter';
import { PlaceSchema } from '../../src/schemas/placeSchema';

interface Call {
  url: string;
  init: RequestInit;
}

/** Mocked fetch returning a scripted Response; records every call. */
const mockFetch = (respond: (call: Call) => Response | Promise<Response>) => {
  const calls: Call[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    const call = { url: String(url), init };
    calls.push(call);
    return respond(call);
  }) as unknown as typeof fetch;
  return { fn, calls };
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const adapter = (fetchFn: typeof fetch, platform: 'web' | 'native' = 'native', timeoutMs = 2000) =>
  new OpenStreetMapPlacesAdapter({
    overpassUrl: 'https://overpass.test/api/interpreter',
    nominatimUrl: 'https://nominatim.test/',
    userAgent: 'MouthJournal-Test/1.0',
    platform,
    timeoutMs,
    fetchFn,
  });

const origin = { latitude: -6.2297, longitude: 106.8164 };
const decodeQuery = (init: RequestInit) => decodeURIComponent(String(init.body).replace(/^data=/, ''));

const sample = {
  elements: [
    { type: 'node', id: 1, lat: -6.23, lon: 106.817, tags: { name: 'Kopi Node', amenity: 'cafe', 'addr:street': 'Jl. Senopati', 'addr:housenumber': '12', 'addr:city': 'Jakarta', website: 'https://kopi.test', opening_hours: 'Mo-Su 08:00-22:00' } },
    { type: 'way', id: 2, center: { lat: -6.24, lon: 106.82 }, tags: { name: 'Resto Way', amenity: 'restaurant' } },
    { type: 'relation', id: 3, center: { lat: -6.25, lon: 106.83 }, tags: { name: 'Taman Rel', leisure: 'park' } },
    { type: 'node', id: 4, lat: -6.23, lon: 106.81, tags: { amenity: 'cafe' } },
    { type: 'node', id: 5, tags: { name: 'No Coords', amenity: 'cafe' } },
    { type: 'way', id: 6, tags: { name: 'Way Without Center', amenity: 'cafe' } },
    { type: 'node', id: 7, lat: -6.2, lon: 106.8 },
    { type: 'node', id: 8, lat: 'bad', lon: 106.8, tags: { name: 'Bad Lat' } },
    { type: 'node', id: 9, lat: -6.2, lon: 106.8, tags: { name: 'HTTP Site', amenity: 'bar', website: 'http://insecure.test' } },
    'garbage',
  ],
};

describe('OSM adapter: Overpass searchNearby', () => {
  test('200 valid response → only schema-valid places with real coordinates, sorted by distance, no ratings', async () => {
    const { fn, calls } = mockFetch(() => json(sample));
    const places = await adapter(fn).searchNearby({ ...origin, radiusMeters: 3000, category: 'all' });
    assert.deepEqual(places.map((p) => p.id).sort(), ['osm-node-1', 'osm-node-9', 'osm-relation-3', 'osm-way-2']);
    for (const p of places) {
      assert.equal(PlaceSchema.safeParse(p).success, true);
      assert.equal(p.ratingAverage, undefined);
      assert.equal(p.ratingCount, undefined);
      assert.equal(typeof p.distanceMeter, 'number');
    }
    assert.ok(places.every((p, i) => i === 0 || (places[i - 1].distanceMeter ?? 0) <= (p.distanceMeter ?? 0)));
    const node = places.find((p) => p.id === 'osm-node-1')!;
    assert.equal(node.address, 'Jl. Senopati No. 12, Jakarta');
    assert.equal(node.website, 'https://kopi.test');
    assert.equal(places.find((p) => p.id === 'osm-node-9')!.website, undefined, 'http website dropped');
    const way = places.find((p) => p.id === 'osm-way-2')!;
    assert.deepEqual([way.latitude, way.longitude], [-6.24, 106.82], 'way coordinates from center');
    assert.equal(way.address, '', 'no invented address');

    assert.equal(calls.length, 1);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal((calls[0].init.headers as Record<string, string>)['User-Agent'], 'MouthJournal-Test/1.0');
    const q = decodeQuery(calls[0].init);
    assert.match(q, /\[out:json\]\[timeout:15\]/);
    assert.match(q, /around:3000,-6\.2297,106\.8164/);
    assert.match(q, /out center tags 50;/);
  });

  test('zero elements → empty list (not an error, not mock data)', async () => {
    const { fn } = mockFetch(() => json({ elements: [] }));
    assert.deepEqual(await adapter(fn).searchNearby({ ...origin }), []);
  });

  test('HTTP 429 → rate_limited error', async () => {
    const { fn } = mockFetch(() => new Response('Too Many Requests', { status: 429 }));
    await assert.rejects(adapter(fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'rate_limited' && e.status === 429);
  });

  test('HTTP 500 → http error; 504 → timeout', async () => {
    await assert.rejects(adapter(mockFetch(() => new Response('x', { status: 500 })).fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'http' && e.status === 500);
    await assert.rejects(adapter(mockFetch(() => new Response('x', { status: 504 })).fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'timeout');
  });

  test('malformed JSON → malformed error', async () => {
    const { fn } = mockFetch(() => new Response('<html>oops</html>', { status: 200 }));
    await assert.rejects(adapter(fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'malformed');
  });

  test('JSON without elements array → malformed error', async () => {
    await assert.rejects(adapter(mockFetch(() => json({ version: 0.6 })).fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'malformed');
    await assert.rejects(adapter(mockFetch(() => json({ elements: 'nope' })).fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'malformed');
  });

  test('Overpass runtime error reported in remark (HTTP 200) → upstream error', async () => {
    const { fn } = mockFetch(() => json({ elements: [], remark: 'runtime error: Query timed out in "query" at line 3 after 15 seconds.' }));
    await assert.rejects(adapter(fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'upstream');
  });

  test('request that never answers → timeout error (fetch aborted)', async () => {
    let aborted = false;
    const fn = ((_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () => {
          aborted = true;
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      })) as unknown as typeof fetch;
    const started = Date.now();
    await assert.rejects(adapter(fn, 'native', 100).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'timeout');
    assert.ok(Date.now() - started < 2000);
    assert.equal(aborted, true);
  });

  test('network failure → network error', async () => {
    const fn = (async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    await assert.rejects(adapter(fn).searchNearby(origin), (e: PlacesProviderError) => e.kind === 'network');
  });

  test('web platform does not try to set the forbidden User-Agent header', async () => {
    const { fn, calls } = mockFetch(() => json({ elements: [] }));
    await adapter(fn, 'web').searchNearby(origin);
    assert.equal((calls[0].init.headers as Record<string, string>)['User-Agent'], undefined);
  });

  test('category filters are anchored and radius is clamped', async () => {
    const { fn, calls } = mockFetch(() => json({ elements: [] }));
    await adapter(fn).searchNearby({ ...origin, category: 'drinks', radiusMeters: 999_999 });
    const q = decodeQuery(calls[0].init);
    assert.match(q, /\["amenity"~"\^\(cafe\|bar\|pub\)\$"\]/);
    assert.match(q, /around:20000,/);
  });

  test('keyword search is escaped for both Overpass string and regex layers', async () => {
    assert.equal(escapeOverpassRegex('a.b'), 'a\\\\.b');
    assert.equal(escapeOverpassRegex('say "hi"'), 'say \\"hi\\"');
    const { fn, calls } = mockFetch(() => json({ elements: [] }));
    await adapter(fn).searchNearby({ ...origin, keyword: 'Kopi (Senopati)' });
    assert.match(decodeQuery(calls[0].init), /\["name"~"Kopi \\\\\(Senopati\\\\\)",i\]/);
  });

  test('invalid coordinates are rejected before any request', async () => {
    const { fn, calls } = mockFetch(() => json({ elements: [] }));
    await assert.rejects(adapter(fn).searchNearby({ latitude: NaN, longitude: 106 }), PlacesProviderError);
    assert.equal(calls.length, 0);
  });
});

describe('OSM adapter: getPlaceDetails supports node / way / relation', () => {
  for (const [id, type, el] of [
    ['osm-node-1', 'node', sample.elements[0]],
    ['osm-way-2', 'way', sample.elements[1]],
    ['osm-relation-3', 'relation', sample.elements[2]],
  ] as const) {
    test(`${type} id → ${type}(n) query with center`, async () => {
      const { fn, calls } = mockFetch(() => json({ elements: [el] }));
      const place = await adapter(fn).getPlaceDetails(id);
      assert.equal(place?.id, id);
      assert.equal(place?.osmType, type);
      assert.match(decodeQuery(calls[0].init), new RegExp(`${type}\\(\\d+\\);\\nout center tags;`));
    });
  }

  test('legacy "osm-123" ids are treated as nodes', () => {
    assert.deepEqual(parseOsmPlaceId('osm-123'), { type: 'node', id: 123 });
  });

  test('unknown id format is rejected without a request', async () => {
    const { fn, calls } = mockFetch(() => json({ elements: [] }));
    await assert.rejects(adapter(fn).getPlaceDetails('manual-abc'), (e: PlacesProviderError) => e.kind === 'invalid_id');
    assert.equal(calls.length, 0);
  });

  test('not found → null; element without coordinates → null (no fake place)', async () => {
    assert.equal(await adapter(mockFetch(() => json({ elements: [] })).fn).getPlaceDetails('osm-node-1'), null);
    assert.equal(await adapter(mockFetch(() => json({ elements: [sample.elements[4]] })).fn).getPlaceDetails('osm-node-5'), null);
  });
});

describe('Nominatim reverseGeocode', () => {
  test('valid response → display_name; URL params are encoded', async () => {
    const { fn, calls } = mockFetch(() => json({ display_name: 'Jl. Senopati, Jakarta', lat: '-6.2' }));
    assert.equal(await adapter(fn).reverseGeocode(-6.2297, 106.8164), 'Jl. Senopati, Jakarta');
    assert.equal(calls[0].url, 'https://nominatim.test/reverse?format=jsonv2&lat=-6.2297&lon=106.8164');
    assert.equal((calls[0].init.headers as Record<string, string>)['Accept-Language'], 'id,en');
  });

  test('"Unable to geocode" → null', async () => {
    assert.equal(await adapter(mockFetch(() => json({ error: 'Unable to geocode' })).fn).reverseGeocode(0, 0), null);
  });

  test('missing/invalid display_name → malformed error', async () => {
    await assert.rejects(adapter(mockFetch(() => json({ name: 'x' })).fn).reverseGeocode(0, 0), (e: PlacesProviderError) => e.kind === 'malformed');
    await assert.rejects(adapter(mockFetch(() => json({ display_name: 42 })).fn).reverseGeocode(0, 0), (e: PlacesProviderError) => e.kind === 'malformed');
  });

  test('HTTP 403 and invalid coordinates are errors', async () => {
    await assert.rejects(adapter(mockFetch(() => new Response('', { status: 403 })).fn).reverseGeocode(0, 0), (e: PlacesProviderError) => e.kind === 'http');
    await assert.rejects(adapter(mockFetch(() => json({})).fn).reverseGeocode(Infinity, 0), PlacesProviderError);
  });
});
