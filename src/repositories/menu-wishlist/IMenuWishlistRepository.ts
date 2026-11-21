import { MenuWishlistAddInput, MenuWishlistItem } from '../../models/menuWishlist';
import { MutationResult, SyncState } from '../sync/types';

export interface IMenuWishlistRepository {
  getMenuWishlist(userId: string): Promise<MenuWishlistItem[]>;
  addMenuWishlist(userId: string, item: MenuWishlistAddInput): Promise<MutationResult<MenuWishlistItem>>;
  removeMenuWishlist(userId: string, id: string): Promise<MutationResult<{ id: string }>>;
  getSyncState(userId: string): Promise<SyncState>;
  syncPending(userId: string): Promise<SyncState>;
  clearUserCache(userId: string): Promise<void>;
}
