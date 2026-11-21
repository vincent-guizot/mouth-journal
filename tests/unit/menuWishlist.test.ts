import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MenuWishlistItemSchema,
  MenuWishlistAddInputSchema,
} from '../../src/schemas/menuWishlistSchema';

describe('MenuWishlistSchema validation', () => {
  const validItem = {
    id: 'mw-12345',
    userId: 'user-alice',
    placeId: 'osm-node-100',
    placeName: 'Kopi Kenangan Senopati',
    menuName: 'Kenangan Mantap',
    category: 'drink' as const,
    estimatedPrice: 22000,
    notes: 'Mau coba yang less sugar',
    photoUrl: 'https://images.example.com/kenangan.jpg',
    createdAt: '2026-11-01T10:00:00.000Z',
  };

  test('accepts a valid menu wishlist item', () => {
    const parsed = MenuWishlistItemSchema.parse(validItem);
    assert.equal(parsed.menuName, 'Kenangan Mantap');
    assert.equal(parsed.placeName, 'Kopi Kenangan Senopati');
    assert.equal(parsed.estimatedPrice, 22000);
  });

  test('rejects empty menuName or placeName', () => {
    assert.throws(() =>
      MenuWishlistItemSchema.parse({
        ...validItem,
        menuName: '   ',
      })
    );
    assert.throws(() =>
      MenuWishlistItemSchema.parse({
        ...validItem,
        placeName: '',
      })
    );
  });

  test('rejects negative estimatedPrice and non-integer price', () => {
    assert.throws(() =>
      MenuWishlistItemSchema.parse({
        ...validItem,
        estimatedPrice: -5000,
      })
    );
    assert.throws(() =>
      MenuWishlistItemSchema.parse({
        ...validItem,
        estimatedPrice: 25000.5,
      })
    );
  });

  test('rejects http photoUrl (must be https)', () => {
    assert.throws(() =>
      MenuWishlistItemSchema.parse({
        ...validItem,
        photoUrl: 'http://images.example.com/insecure.jpg',
      })
    );
  });

  test('validates MenuWishlistAddInputSchema with optional fields', () => {
    const input = {
      placeId: 'osm-node-200',
      placeName: 'Bakmi GM',
      menuName: 'Bakmi Spesial GM',
      category: 'food' as const,
      estimatedPrice: 38000,
    };
    const parsed = MenuWishlistAddInputSchema.parse(input);
    assert.equal(parsed.menuName, 'Bakmi Spesial GM');
    assert.equal(parsed.estimatedPrice, 38000);
    assert.equal(parsed.notes, undefined);
  });
});
