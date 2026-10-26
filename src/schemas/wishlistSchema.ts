import { z } from 'zod';

export const WishlistItemSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  placeId: z.string().min(1),
  placeName: z.string().min(1, 'Nama tempat wajib diisi'),
  placeAddress: z.string().default(''),
  mainCategory: z.enum(['food', 'drinks', 'wisata']),
  subCategory: z.string().default('cafe'),
  latitude: z.number(),
  longitude: z.number(),
  photoUrl: z.string().url().optional(),
  ratingAverage: z.number().min(0).max(5).optional(),
  personalNotes: z.string().max(500).optional(),
  createdAt: z.string(),
});

export type WishlistItemInput = z.infer<typeof WishlistItemSchema>;
