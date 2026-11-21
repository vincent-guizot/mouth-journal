import { z } from 'zod';
import {
  HttpsUrlSchema,
  IsoDateTimeSchema,
  SafeIdSchema,
} from './common';

export const MenuCategorySchema = z.enum(['food', 'drink', 'dessert', 'snack']);

export const MenuWishlistItemSchema = z.object({
  id: SafeIdSchema,
  userId: z.string().min(1),
  placeId: SafeIdSchema,
  placeName: z.string().trim().min(1, 'Nama tempat wajib diisi').max(200),
  menuName: z.string().trim().min(1, 'Nama menu wajib diisi').max(120),
  category: MenuCategorySchema.optional(),
  estimatedPrice: z
    .number()
    .int('Harga harus bilangan bulat')
    .nonnegative('Harga tidak boleh negatif')
    .max(100_000_000)
    .optional(),
  notes: z.string().max(500).optional(),
  photoUrl: HttpsUrlSchema.optional(),
  createdAt: IsoDateTimeSchema,
});

export const MenuWishlistAddInputSchema = z.object({
  placeId: SafeIdSchema,
  placeName: z.string().trim().min(1, 'Nama tempat wajib diisi').max(200),
  menuName: z.string().trim().min(1, 'Nama menu wajib diisi').max(120),
  category: MenuCategorySchema.optional(),
  estimatedPrice: z
    .number()
    .int('Harga harus bilangan bulat')
    .nonnegative('Harga tidak boleh negatif')
    .max(100_000_000)
    .optional(),
  notes: z.string().max(500).optional(),
  photoUrl: HttpsUrlSchema.optional(),
});

export type MenuWishlistItem = z.infer<typeof MenuWishlistItemSchema>;
export type MenuWishlistAddInput = z.input<typeof MenuWishlistAddInputSchema>;
export type MenuWishlistCategory = z.infer<typeof MenuCategorySchema>;
