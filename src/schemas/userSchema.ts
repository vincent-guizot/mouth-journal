import { z } from 'zod';

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email('Format email tidak valid'),
  displayName: z.string().min(1, 'Nama lengkap wajib diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(300, 'Bio maksimal 300 karakter').optional(),
  photoURL: z.string().url().optional(),
  bannerURL: z.string().url().optional(),
  culinaryPreferences: z.array(z.string()).default([]),
  favoriteVenueTypes: z.array(z.string()).default([]),
  budgetPerVisit: z.string().optional(),
  favoriteLocations: z.array(z.string()).default([]),
  socialInstagram: z.string().optional(),
  socialTikTok: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
