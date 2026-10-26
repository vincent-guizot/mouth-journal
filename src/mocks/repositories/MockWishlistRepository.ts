import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem } from '../../models/wishlist';
import { IWishlistRepository } from '../../repositories/wishlist/IWishlistRepository';
import { MOCK_WISHLIST } from '../data/mockWishlist';

const getStorageKey = (userId: string) => `@mouthjournal_mock_${userId}_wishlist`;

export class MockWishlistRepository implements IWishlistRepository {
  private inMemoryWishlist: Map<string, WishlistItem[]> = new Map();

  private async loadUserWishlist(userId: string): Promise<WishlistItem[]> {
    if (this.inMemoryWishlist.has(userId)) {
      return this.inMemoryWishlist.get(userId)!;
    }

    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.inMemoryWishlist.set(userId, parsed);
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    const defaultData = MOCK_WISHLIST.map((item) => ({ ...item, userId }));
    this.inMemoryWishlist.set(userId, defaultData);
    return defaultData;
  }

  private async persistUserWishlist(userId: string, items: WishlistItem[]): Promise<void> {
    this.inMemoryWishlist.set(userId, items);
    try {
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(items));
    } catch {
      // Ignore
    }
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!userId) return [];
    return this.loadUserWishlist(userId);
  }

  async addToWishlist(
    userId: string,
    item: Omit<WishlistItem, 'id' | 'createdAt' | 'userId'>
  ): Promise<WishlistItem> {
    const list = await this.loadUserWishlist(userId);
    const newItem: WishlistItem = {
      ...item,
      id: `mock-wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...list];
    await this.persistUserWishlist(userId, updated);
    return newItem;
  }

  async addWishlistItem(userId: string, item: any): Promise<WishlistItem> {
    return this.addToWishlist(userId, item);
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    const list = await this.loadUserWishlist(userId);
    const filtered = list.filter((i) => i.id !== itemId);
    await this.persistUserWishlist(userId, filtered);
  }

  async deleteWishlistItem(userId: string, itemId: string): Promise<void> {
    return this.removeFromWishlist(userId, itemId);
  }

  async isInWishlist(userId: string, placeId: string): Promise<boolean> {
    const list = await this.loadUserWishlist(userId);
    return list.some((i) => i.placeId === placeId);
  }

  async clearUserCache(userId: string): Promise<void> {
    this.inMemoryWishlist.delete(userId);
    try {
      await AsyncStorage.removeItem(getStorageKey(userId));
    } catch {
      // Ignore
    }
  }
}
