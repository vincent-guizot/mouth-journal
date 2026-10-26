import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../config/firebase';
import { UserProfile } from '../../models/user';
import { UserProfileSchema } from '../../schemas/userSchema';
import { IUserProfileRepository } from './IUserProfileRepository';

const getCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_profile`;

export class FirestoreUserProfileRepository implements IUserProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;

    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const parsed = UserProfileSchema.safeParse({ uid: docSnap.id, ...docSnap.data() });
          if (parsed.success) {
            await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(parsed.data));
            return parsed.data;
          }
        }
      } catch (err) {
        console.warn(`[UserProfileRepository] Gagal getDoc Firestore user ${userId}:`, err);
      }
    }

    const cached = await AsyncStorage.getItem(getCacheKey(userId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const validated = UserProfileSchema.safeParse(parsed);
        if (validated.success) return validated.data;
      } catch {
        return null;
      }
    }

    return null;
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    if (!userId) throw new Error('User ID wajib diisi.');

    const validated = UserProfileSchema.parse({
      ...profile,
      uid: userId,
      updatedAt: new Date().toISOString(),
    });

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, validated);
    }

    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(validated));
    return validated;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!userId) throw new Error('User ID wajib diisi.');

    const current = (await this.getProfile(userId)) || {
      uid: userId,
      email: updates.email || 'user@mouthjournal.com',
      displayName: updates.displayName || 'Culinary Explorer',
    };

    const merged = {
      ...current,
      ...updates,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };

    const validated = UserProfileSchema.parse(merged);

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, validated as any);
    }

    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(validated));
    return validated;
  }

  async clearUserCache(userId: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.removeItem(getCacheKey(userId));
  }
}
