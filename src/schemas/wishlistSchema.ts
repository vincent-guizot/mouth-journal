import { z } from 'zod';
import {
  HttpsUrlSchema,
  IsoDateTimeSchema,
  LatitudeSchema,
  LongitudeSchema,
  MainCategorySchema,
  SafeIdSchema,
} from './common';

/**
 * A wishlist document is keyed by the real place ID (`id === placeId`), so the same
 * place can never be saved twice and add/remove/isInWishlist all use one key.
 * There is intentionally no rating field: OSM provides none and the app must not
 * invent one.
 */
export const WishlistItemSchema = z
  .object({
    id: SafeIdSchema,
    userId: z.string().min(1),
    placeId: SafeIdSchema,
    placeName: z.string().trim().min(1, 'Nama tempat wajib diisi').max(200),
    placeAddress: z.string().max(300).default(''),
    mainCategory: MainCategorySchema,
    subCategory: z.string().min(1).max(60),
    subCategoryLabel: z.string().min(1).max(60),
    latitude: LatitudeSchema,
    longitude: LongitudeSchema,
    photoUrl: HttpsUrlSchema.optional(),
    personalNotes: z.string().max(500).optional(),
    createdAt: IsoDateTimeSchema,
  })
  .refine((w) => w.id === w.placeId, { path: ['id'], message: 'id wishlist harus sama dengan placeId' });

export const WishlistAddInputSchema = z.object({
  placeId: SafeIdSchema,
  placeName: z.string().trim().min(1).max(200),
  placeAddress: z.string().max(300).default(''),
  mainCategory: MainCategorySchema,
  subCategory: z.string().min(1).max(60),
  subCategoryLabel: z.string().min(1).max(60),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  photoUrl: HttpsUrlSchema.optional(),
  personalNotes: z.string().max(500).optional(),
});

export type WishlistItemInput = z.infer<typeof WishlistItemSchema>;
export type WishlistAddInput = z.input<typeof WishlistAddInputSchema>;
