import { z } from 'zod';

export const PlaceSchema = z.object({
  id: z.string().min(1),
  providerId: z.enum(['osm', 'manual']),
  osmId: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1),
  address: z.string().default(''),
  mainCategory: z.enum(['food', 'drinks', 'wisata']),
  mainCategoryLabel: z.string().default(''),
  subCategory: z.string().default(''),
  subCategoryLabel: z.string().default(''),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
  cuisine: z.string().optional(),
  distanceMeter: z.number().optional(),
  photoUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ratingAverage: z.number().min(0).max(5).optional(),
  ratingCount: z.number().optional(),
  retrievedAt: z.string().optional(),
});

export type PlaceInput = z.infer<typeof PlaceSchema>;
