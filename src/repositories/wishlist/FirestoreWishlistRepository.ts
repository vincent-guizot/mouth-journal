import { WishlistAddInput, WishlistItem } from '../../models/wishlist';
import { WishlistAddInputSchema, WishlistItemSchema } from '../../schemas/wishlistSchema';
import { OfflineCollection } from '../sync/OfflineCollection';
import { MutationResult, RepositoryDeps, SyncState } from '../sync/types';
import { IWishlistRepository } from './IWishlistRepository';

/** /users/{uid}/wishlist/{placeId} */
export class FirestoreWishlistRepository implements IWishlistRepository {
  private readonly store: OfflineCollection<WishlistItem>;

  constructor(deps: RepositoryDeps) {
    this.store = new OfflineCollection<WishlistItem>(deps, {
      name: 'wishlist',
      path: (uid) => ['users', uid, 'wishlist'],
      schema: WishlistItemSchema,
      orderByField: 'createdAt',
    });
  }

  getWishlist(userId: string): Promise<WishlistItem[]> {
    return this.store.list(userId);
  }

  async addToWishlist(userId: string, input: WishlistAddInput): Promise<MutationResult<WishlistItem>> {
    this.store.assertUsable(userId);
    const parsedInput = WishlistAddInputSchema.parse(input);
    const existing = (await this.store.readCache(userId)).find((w) => w.placeId === parsedInput.placeId);
    if (existing) {
      const state = await this.store.getSyncState(userId);
      return { data: existing, sync: this.store.isLocalOnly ? 'local' : state.pending > 0 ? 'pending' : 'synced' };
    }
    const item = WishlistItemSchema.parse({
      ...parsedInput,
      id: parsedInput.placeId,
      userId,
      createdAt: this.store.now().toISOString(),
    });
    const sync = await this.store.mutate(userId, { kind: 'upsert', data: item });
    return { data: item, sync };
  }

  async removeFromWishlist(userId: string, placeId: string): Promise<MutationResult<{ placeId: string }>> {
    this.store.assertUsable(userId);
    if (!placeId) throw new Error('placeId wajib diisi.');
    const sync = await this.store.mutate(userId, { kind: 'delete', docId: placeId });
    return { data: { placeId }, sync };
  }

  async isInWishlist(userId: string, placeId: string): Promise<boolean> {
    if (!placeId) return false;
    return (await this.store.get(userId, placeId)) !== null;
  }

  getSyncState(userId: string): Promise<SyncState> {
    return this.store.getSyncState(userId);
  }

  syncPending(userId: string): Promise<SyncState> {
    return this.store.flush(userId);
  }

  clearUserCache(userId: string): Promise<void> {
    return this.store.clear(userId);
  }
}
