import type { ZodType } from 'zod';
import { JournalSchema, LocalJournalSchema } from '../schemas/journalSchema';
import { PlaceSchema } from '../schemas/placeSchema';
import { SAFE_ID_PATTERN } from '../utils/ids';
import type { Journal } from '../models/journal';
import type { Place } from '../models/place';

/**
 * Expo Router params are `string | string[] | undefined`. These helpers normalise
 * and validate them so screens never receive an unchecked JSON cast.
 */
export type RawParam = string | string[] | undefined;

export const singleParam = (raw: RawParam): string | undefined => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === undefined || v === '' ? undefined : v;
};

export const parseIdParam = (raw: RawParam): string | null => {
  const v = singleParam(raw);
  return v && SAFE_ID_PATTERN.test(v) ? v : null;
};

export type ParsedParam<T> = { status: 'absent' } | { status: 'valid'; data: T } | { status: 'invalid'; reason: string };

export const parseJsonParam = <T>(raw: RawParam, schema: ZodType<T>): ParsedParam<T> => {
  const v = singleParam(raw);
  if (v === undefined) return { status: 'absent' };
  let json: unknown;
  try {
    json = JSON.parse(v);
  } catch {
    return { status: 'invalid', reason: 'JSON tidak valid' };
  }
  const result = schema.safeParse(json);
  return result.success
    ? { status: 'valid', data: result.data }
    : { status: 'invalid', reason: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
};

/**
 * initialData for /places/[placeId]: must pass PlaceSchema AND describe the same
 * place as the path param, otherwise it is ignored and the place is re-fetched.
 */
export const parsePlaceInitialData = (placeId: string | null, raw: RawParam): Place | null => {
  const parsed = parseJsonParam(raw, PlaceSchema);
  return parsed.status === 'valid' && parsed.data.id === placeId ? parsed.data : null;
};

/**
 * initialData for journal routes: must pass the journal schema, match the path id
 * and belong to the signed-in user. Used only for a fast first paint; the
 * repository copy always replaces it.
 */
export const parseJournalInitialData = (
  journalId: string | null,
  userId: string | undefined,
  raw: RawParam,
  allowLocalPhotos = false
): Journal | null => {
  const parsed = parseJsonParam(raw, allowLocalPhotos ? LocalJournalSchema : JournalSchema);
  if (parsed.status !== 'valid') return null;
  return parsed.data.id === journalId && parsed.data.userId === userId ? parsed.data : null;
};
