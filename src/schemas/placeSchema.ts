import { z } from 'zod';
import { HttpsUrlSchema, IsoDateTimeSchema, LatitudeSchema, LongitudeSchema, MainCategorySchema, SafeIdSchema } from './common';

export const OsmElementTypeSchema = z.enum(['node', 'way', 'relation']);

export const PlaceSchema = z.object({
  id: SafeIdSchema,
  providerId: z.enum(['osm', 'manual']),
  osmType: OsmElementTypeSchema.optional(),
  osmId: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(200),
  address: z.string().max(300).default(''),
  mainCategory: MainCategorySchema,
  mainCategoryLabel: z.string().default(''),
  subCategory: z.string().default(''),
  subCategoryLabel: z.string().default(''),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  phone: z.string().max(60).optional(),
  website: HttpsUrlSchema.optional(),
  openingHours: z.string().max(300).optional(),
  cuisine: z.string().max(200).optional(),
  distanceMeter: z.number().nonnegative().optional(),
  photoUrl: HttpsUrlSchema.optional(),
  tags: z.array(z.string()).default([]),
  /** Only set when a real rating source exists. OSM has none. */
  ratingAverage: z.number().min(1).max(5).optional(),
  ratingCount: z.number().int().nonnegative().optional(),
  retrievedAt: IsoDateTimeSchema.optional(),
});

export type PlaceInput = z.infer<typeof PlaceSchema>;
