import { WishlistAddInput, WishlistItem } from '../../models/wishlist';
import { MutationResult, SyncState } from '../sync/types';

/** Wishlist entries are keyed by the real place ID (document ID === placeId). */
export interface IWishlistRepository {
  getWishlist(userId: string): Promise<WishlistItem[]>;
  /** Idempotent: adding an already-saved placeId returns the existing item. */
  addToWishlist(userId: string, item: WishlistAddInput): Promise<MutationResult<WishlistItem>>;
  removeFromWishlist(userId: string, placeId: string): Promise<MutationResult<{ placeId: string }>>;
  isInWishlist(userId: string, placeId: string): Promise<boolean>;
  getSyncState(userId: string): Promise<SyncState>;
  syncPending(userId: string): Promise<SyncState>;
  clearUserCache(userId: string): Promise<void>;
}
