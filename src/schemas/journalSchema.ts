import { z } from 'zod';

export const CriteriaRatingSchema = z.object({
  taste: z.number().min(1).max(5),
  ambiance: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  price: z.number().min(1).max(5),
});

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Nama menu wajib diisi'),
  price: z.number().nonnegative('Harga tidak boleh negatif'),
  category: z.enum(['food', 'drink', 'dessert', 'snack']).optional(),
  rating: z.number().min(1).max(5).optional(),
  isRecommended: z.boolean().optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const JournalSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().optional(),
  placeId: z.string().min(1),
  placeName: z.string().min(1, 'Nama tempat wajib diisi'),
  placeAddress: z.string().default(''),
  mainCategory: z.enum(['food', 'drinks', 'wisata']),
  subCategory: z.string().default('cafe'),
  subCategoryLabel: z.string().default('Kopi/Cafe'),
  latitude: z.number(),
  longitude: z.number(),
  photoUrls: z.array(z.string()).default([]),
  overallRating: z.number().min(0).max(5),
  criteriaRating: CriteriaRatingSchema,
  menuItems: z.array(MenuItemSchema).default([]),
  totalSpent: z.number().nonnegative().default(0),
  reviewText: z.string().max(1000).default(''),
  tags: z.array(z.string()).default([]),
  visitedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type JournalInput = z.infer<typeof JournalSchema>;
