import { z } from 'zod';
import { HttpsUrlSchema, IsoDateTimeSchema, photoUriSchema } from './common';

const profileObject = (allowLocalPhotos: boolean) =>
  z.object({
    uid: z.string().min(1),
    email: z.email('Format email tidak valid'),
    displayName: z.string().trim().min(1, 'Nama lengkap wajib diisi').max(80),
    username: z
      .string()
      .regex(/^[a-z0-9._]{3,30}$/, 'Username 3–30 karakter: huruf kecil, angka, titik, garis bawah')
      .optional(),
    phoneNumber: z.string().max(30).optional(),
    bio: z.string().max(300, 'Bio maksimal 300 karakter').optional(),
    photoURL: photoUriSchema(allowLocalPhotos).optional(),
    bannerURL: photoUriSchema(allowLocalPhotos).optional(),
    culinaryPreferences: z.array(z.string().max(60)).max(30).default([]),
    favoriteVenueTypes: z.array(z.string().max(60)).max(30).default([]),
    budgetPerVisit: z.string().max(60).optional(),
    favoriteLocations: z.array(z.string().max(80)).max(30).default([]),
    socialInstagram: z.string().max(60).optional(),
    socialTikTok: z.string().max(60).optional(),
    createdAt: IsoDateTimeSchema.optional(),
    updatedAt: IsoDateTimeSchema.optional(),
  });

/** Canonical Firestore profile contract (`/users/{uid}`). */
export const UserProfileSchema = profileObject(false);
/** Demo/local mode only. */
export const LocalUserProfileSchema = profileObject(true);

export const userProfileSchemaFor = (allowLocalPhotos: boolean) =>
  allowLocalPhotos ? LocalUserProfileSchema : UserProfileSchema;

export { HttpsUrlSchema };
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
