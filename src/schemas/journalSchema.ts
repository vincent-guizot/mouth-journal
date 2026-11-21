import { z } from 'zod';
import {
  IsoDateTimeSchema,
  LatitudeSchema,
  LongitudeSchema,
  MainCategorySchema,
  SafeIdSchema,
  photoUriSchema,
} from './common';

/** Star input is 1..5 whole stars; 0 means "not rated yet" and is never persisted. */
export const StarRatingSchema = z
  .number()
  .int('Rating harus bilangan bulat 1–5')
  .min(1, 'Semua kriteria wajib diberi rating 1–5')
  .max(5, 'Rating maksimal 5');

export const CriteriaRatingSchema = z.object({
  taste: StarRatingSchema,
  ambiance: StarRatingSchema,
  service: StarRatingSchema,
  price: StarRatingSchema,
});

export type CriteriaRatingInput = z.infer<typeof CriteriaRatingSchema>;

/** Single source of truth for the overall rating: mean of 4 criteria, 1 decimal. */
export const computeOverallRating = (c: CriteriaRatingInput): number =>
  Math.round(((c.taste + c.ambiance + c.service + c.price) / 4) * 10) / 10;

/** Clock skew tolerated between device clock and "now" for visit dates. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

const menuItemSchema = (allowLocal: boolean) =>
  z.object({
    id: SafeIdSchema,
    name: z.string().trim().min(1, 'Nama menu wajib diisi').max(120),
    price: z.number().int('Harga harus bilangan bulat').nonnegative('Harga tidak boleh negatif').max(100_000_000),
    category: z.enum(['food', 'drink', 'dessert', 'snack']).optional(),
    rating: StarRatingSchema.optional(),
    isRecommended: z.boolean().optional(),
    photoUrl: photoUriSchema(allowLocal).optional(),
    notes: z.string().max(500).optional(),
  });

export const MenuItemSchema = menuItemSchema(false);

const journalObject = (allowLocal: boolean) =>
  z.object({
    id: SafeIdSchema,
    userId: z.string().min(1),
    userName: z.string().max(120).optional(),
    placeId: SafeIdSchema,
    placeName: z.string().trim().min(1, 'Nama tempat wajib diisi').max(200),
    placeAddress: z.string().max(300).default(''),
    mainCategory: MainCategorySchema,
    subCategory: z.string().min(1).max(60),
    subCategoryLabel: z.string().min(1).max(60),
    /** null for manually entered places without verified coordinates. */
    latitude: LatitudeSchema.nullable(),
    longitude: LongitudeSchema.nullable(),
    photoUrls: z.array(photoUriSchema(allowLocal)).max(10).default([]),
    overallRating: z.number().min(1).max(5),
    criteriaRating: CriteriaRatingSchema,
    menuItems: z.array(menuItemSchema(allowLocal)).max(50).default([]),
    totalSpent: z.number().int().nonnegative().default(0),
    reviewText: z.string().max(1000).default(''),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    visitedAt: IsoDateTimeSchema,
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema.optional(),
  });

type JournalShape = z.infer<ReturnType<typeof journalObject>>;

const refineJournal = (j: JournalShape, ctx: z.RefinementCtx) => {
  const expected = computeOverallRating(j.criteriaRating);
  if (Math.abs(j.overallRating - expected) > 1e-9) {
    ctx.addIssue({
      code: 'custom',
      path: ['overallRating'],
      message: `overallRating (${j.overallRating}) harus sama dengan rata-rata kriteria (${expected})`,
    });
  }
  if ((j.latitude === null) !== (j.longitude === null)) {
    ctx.addIssue({ code: 'custom', path: ['latitude'], message: 'latitude dan longitude harus diisi bersamaan' });
  }
  const expectedTotal = j.menuItems.reduce((sum, m) => sum + m.price, 0);
  if (j.menuItems.length > 0 && j.totalSpent !== expectedTotal) {
    ctx.addIssue({ code: 'custom', path: ['totalSpent'], message: 'totalSpent harus sama dengan jumlah harga menu' });
  }
  const created = Date.parse(j.createdAt);
  // A visit cannot be recorded before it happened: visitedAt <= last write time.
  const lastWrite = j.updatedAt ? Date.parse(j.updatedAt) : created;
  if (Date.parse(j.visitedAt) > lastWrite + FUTURE_TOLERANCE_MS) {
    ctx.addIssue({ code: 'custom', path: ['visitedAt'], message: 'Tanggal kunjungan tidak boleh di masa depan' });
  }
  if (j.updatedAt && Date.parse(j.updatedAt) < created) {
    ctx.addIssue({ code: 'custom', path: ['updatedAt'], message: 'updatedAt tidak boleh sebelum createdAt' });
  }
};

/** Canonical contract for anything stored in Firestore: photo URLs must be https. */
export const JournalSchema = journalObject(false).superRefine(refineJournal);

/** Explicit demo/local mode only: allows device-local photo URIs. */
export const LocalJournalSchema = journalObject(true).superRefine(refineJournal);

export const journalSchemaFor = (allowLocalPhotos: boolean) =>
  allowLocalPhotos ? LocalJournalSchema : JournalSchema;

export type JournalInput = z.infer<typeof JournalSchema>;
