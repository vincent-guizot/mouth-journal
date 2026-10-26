import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../config/firebase';
import { WishlistItem } from '../../models/wishlist';
import { WishlistItemSchema } from '../../schemas/wishlistSchema';
import { IWishlistRepository } from './IWishlistRepository';

const getCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_wishlist`;

export class FirestoreWishlistRepository implements IWishlistRepository {
  /**
   * Mengambil wishlist milik pengguna dari /users/{userId}/wishlist
   */
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!userId) throw new Error('User ID diperlukan untuk mengambil wishlist.');

    // 1. Coba ambil dari Firestore
    if (isFirebaseConfigured && db) {
      try {
        const wishlistRef = collection(db, 'users', userId, 'wishlist');
        const q = query(wishlistRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const remoteItems: WishlistItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };
          const parsed = WishlistItemSchema.safeParse(data);
          if (parsed.success) {
            remoteItems.push(parsed.data);
          }
        });

        // Simpan ke cache lokal terisolasi
        await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(remoteItems));
        return remoteItems;
      } catch (err) {
        console.warn(`[WishlistRepository] Gagal mengambil dari Firestore untuk user ${userId}, membaca cache:`, err);
      }
    }

    // 2. Baca dari cache lokal terisolasi
    const cached = await AsyncStorage.getItem(getCacheKey(userId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }

    return [];
  }

  /**
   * Menambahkan item ke wishlist
   */
  async addToWishlist(userId: string, itemInput: Omit<WishlistItem, 'id' | 'createdAt' | 'userId'>): Promise<WishlistItem> {
    if (!userId) throw new Error('User ID wajib untuk menambahkan wishlist.');

    const newId = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullItem: WishlistItem = {
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
      placeId: (itemInput as any).placeId || newId,
      placeName: (itemInput as any).placeName || (itemInput as any).name || 'Tempat Kuliner',
      placeAddress: (itemInput as any).placeAddress || (itemInput as any).address || '',
      mainCategory: (itemInput as any).mainCategory || 'food',
      subCategory: (itemInput as any).subCategory || (itemInput as any).category || 'Cafe',
      latitude: (itemInput as any).latitude || -6.229746,
      longitude: (itemInput as any).longitude || 106.816431,
      photoUrl: (itemInput as any).photoUrl,
      ratingAverage: (itemInput as any).ratingAverage || (itemInput as any).rating,
      personalNotes: (itemInput as any).personalNotes,
    };

    const validated = WishlistItemSchema.parse(fullItem);

    if (isFirebaseConfigured && db) {
      const itemRef = doc(db, 'users', userId, 'wishlist', newId);
      await setDoc(itemRef, validated);
    }

    const current = await this.getWishlist(userId);
    const updated = [validated, ...current.filter((w) => w.placeId !== validated.placeId)];
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(updated));

    return validated;
  }

  async addWishlistItem(userId: string, itemInput: any): Promise<WishlistItem> {
    return this.addToWishlist(userId, itemInput);
  }

  /**
   * Menghapus item dari wishlist
   */
  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    if (!userId || !itemId) return;

    if (isFirebaseConfigured && db) {
      const itemRef = doc(db, 'users', userId, 'wishlist', itemId);
      await deleteDoc(itemRef);
    }

    const current = await this.getWishlist(userId);
    const updated = current.filter((w) => w.id !== itemId && w.placeId !== itemId);
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(updated));
  }

  async deleteWishlistItem(userId: string, itemId: string): Promise<void> {
    return this.removeFromWishlist(userId, itemId);
  }

  /**
   * Cek apakah placeId sudah ada di wishlist
   */
  async isInWishlist(userId: string, placeId: string): Promise<boolean> {
    if (!userId || !placeId) return false;
    const current = await this.getWishlist(userId);
    return current.some((w) => w.placeId === placeId || w.id === placeId);
  }

  /**
   * Membersihkan cache lokal saat pengguna sign out
   */
  async clearUserCache(userId: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.removeItem(getCacheKey(userId));
  }
}
