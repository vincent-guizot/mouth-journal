import { WishlistItem } from '../../models/wishlist';

export interface IWishlistRepository {
  /**
   * Mengambil semua item wishlist milik pengguna
   */
  getWishlist(userId: string): Promise<WishlistItem[]>;

  /**
   * Menambahkan tempat ke wishlist pengguna
   */
  addToWishlist(userId: string, item: Omit<WishlistItem, 'id' | 'createdAt' | 'userId'>): Promise<WishlistItem>;
  addWishlistItem?(userId: string, item: any): Promise<WishlistItem>;

  /**
   * Menghapus item dari wishlist
   */
  removeFromWishlist(userId: string, itemId: string): Promise<void>;
  deleteWishlistItem?(userId: string, itemId: string): Promise<void>;

  /**
   * Cek apakah tempat tertentu sudah ada di wishlist pengguna
   */
  isInWishlist(userId: string, placeId: string): Promise<boolean>;

  /**
   * Membersihkan cache lokal saat pengguna sign out
   */
  clearUserCache(userId: string): Promise<void>;
}
