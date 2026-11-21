/**
 * 📖 Journal & Review Domain Models — derived from the Zod contract so the type and
 * the runtime validation can never drift apart.
 */
import { z } from 'zod';
import { CriteriaRatingSchema, JournalSchema, MenuItemSchema } from '../schemas/journalSchema';

export type CriteriaRating = z.infer<typeof CriteriaRatingSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type Journal = z.infer<typeof JournalSchema>;

/** Fields the client is allowed to author. id/userId/createdAt/updatedAt are owned by the repository. */
export type JournalDraft = Omit<Journal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// Alias for backward compatibility with DiaryEntry
export type DiaryEntry = Journal;
