/** 🔖 Wishlist Domain Model — derived from the Zod contract. */
import { z } from 'zod';
import { WishlistItemSchema, WishlistAddInputSchema } from '../schemas/wishlistSchema';

export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type WishlistAddInput = z.input<typeof WishlistAddInputSchema>;
