/** 👤 User Profile Domain Model — derived from the Zod contract. */
import { z } from 'zod';
import { UserProfileSchema } from '../schemas/userSchema';

export type UserProfile = z.infer<typeof UserProfileSchema>;
