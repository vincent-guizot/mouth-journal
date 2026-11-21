import { z } from 'zod';
import { SAFE_ID_PATTERN } from '../utils/ids';

export const SafeIdSchema = z.string().regex(SAFE_ID_PATTERN, 'ID tidak valid');

/** ISO-8601 timestamp with explicit offset/Z, e.g. 2026-10-26T08:00:00.000Z */
export const IsoDateTimeSchema = z.iso.datetime({ offset: true });

/** Permanent cloud URL (Firebase Storage download URLs and other https images). */
export const HttpsUrlSchema = z.url({ protocol: /^https$/, hostname: z.regexes.domain });

/** Device-local image URI. Only valid in explicit demo/local mode. */
export const LocalImageUriSchema = z
  .string()
  .regex(/^(file|content|ph|assets-library):\/\/.+/, 'URI lokal tidak valid');

export const LatitudeSchema = z.number().finite().min(-90).max(90);
export const LongitudeSchema = z.number().finite().min(-180).max(180);

export const MainCategorySchema = z.enum(['food', 'drinks', 'wisata']);

export const photoUriSchema = (allowLocal: boolean) =>
  allowLocal ? z.union([HttpsUrlSchema, LocalImageUriSchema]) : HttpsUrlSchema;
