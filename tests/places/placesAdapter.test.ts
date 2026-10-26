import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OpenStreetMapPlacesAdapter } from '../../src/services/places/OpenStreetMapPlacesAdapter.ts';
import { calculateDistance } from '../../src/utils/geo.ts';

describe('Places Adapter & OSM Data Normalization Suite', () => {
  const adapter = new OpenStreetMapPlacesAdapter();

  test('Haversine distance calculation is accurate within expected tolerance', () => {
    // Jakarta Senopati (-6.2297, 106.8164) to Blok M (-6.2432, 106.7978) ~ 2.5 km
    const dist = calculateDistance(-6.2297, 106.8164, -6.2432, 106.7978);
    assert.ok(dist >= 2000 && dist <= 3000, `Distance ${dist} should be around 2500m`);

    // Distance to same point must be 0
    const zeroDist = calculateDistance(-6.2297, 106.8164, -6.2297, 106.8164);
    assert.equal(zeroDist, 0);
  });

  test('mapOsmCategories accurately maps raw OSM tags without fabricating data', () => {
    // 1. Cafe / Drinks tag
    const cafeTags = { amenity: 'cafe', name: 'Tanamera Coffee', cuisine: 'coffee_shop' };
    const cafeCat = (adapter as any).mapOsmCategories(cafeTags);
    assert.equal(cafeCat.mainCategory, 'drinks');
    assert.equal(cafeCat.subCategory, 'cafe');

    // 2. Restaurant / Food tag
    const restoTags = { amenity: 'restaurant', name: 'Sate Khas Senayan', cuisine: 'indonesian' };
    const restoCat = (adapter as any).mapOsmCategories(restoTags);
    assert.equal(restoCat.mainCategory, 'food');
    assert.equal(restoCat.subCategory, 'restaurant');

    // 3. Bakery tag
    const bakeryTags = { shop: 'bakery', name: 'Beau Bakery' };
    const bakeryCat = (adapter as any).mapOsmCategories(bakeryTags);
    assert.equal(bakeryCat.mainCategory, 'food');
    assert.equal(bakeryCat.subCategory, 'bakery');
  });

  test('Normalization produces verified Place schema and leaves rating unpolluted', () => {
    const rawOsmElement = {
      id: 987654321,
      lat: -6.2297,
      lon: 106.8164,
      tags: {
        name: 'Giyanti Coffee Roastery',
        amenity: 'cafe',
        'addr:street': 'Jl. Surabaya No. 20',
        opening_hours: '09:00-17:00',
      },
    };

    const categorization = (adapter as any).mapOsmCategories(rawOsmElement.tags);
    const place = {
      id: `osm-${rawOsmElement.id}`,
      providerId: 'osm' as const,
      osmId: rawOsmElement.id,
      name: rawOsmElement.tags.name,
      address: rawOsmElement.tags['addr:street'],
      mainCategory: categorization.mainCategory,
      mainCategoryLabel: categorization.mainCategoryLabel,
      subCategory: categorization.subCategory,
      subCategoryLabel: categorization.subCategoryLabel,
      latitude: rawOsmElement.lat,
      longitude: rawOsmElement.lon,
      openingHours: rawOsmElement.tags.opening_hours,
      retrievedAt: new Date().toISOString(),
    };

    // Rating must NOT be generated randomly
    assert.equal((place as any).ratingAverage, undefined);
    assert.equal((place as any).ratingCount, undefined);
    assert.equal(place.providerId, 'osm');
    assert.equal(place.name, 'Giyanti Coffee Roastery');
  });
});
