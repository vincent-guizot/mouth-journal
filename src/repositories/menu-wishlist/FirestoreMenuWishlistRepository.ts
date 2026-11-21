import { MenuWishlistAddInput, MenuWishlistItem } from '../../models/menuWishlist';
import { MenuWishlistAddInputSchema, MenuWishlistItemSchema } from '../../schemas/menuWishlistSchema';
import { generateId } from '../../utils/ids';
import { OfflineCollection } from '../sync/OfflineCollection';
import { MutationResult, RepositoryDeps, SyncState } from '../sync/types';
import { IMenuWishlistRepository } from './IMenuWishlistRepository';

/** /users/{uid}/menuWishlist/{id} */
export class FirestoreMenuWishlistRepository implements IMenuWishlistRepository {
  private readonly store: OfflineCollection<MenuWishlistItem>;

  constructor(deps: RepositoryDeps) {
    this.store = new OfflineCollection<MenuWishlistItem>(deps, {
      name: 'menuWishlist',
      path: (uid) => ['users', uid, 'menuWishlist'],
      schema: MenuWishlistItemSchema,
      orderByField: 'createdAt',
    });
  }

  getMenuWishlist(userId: string): Promise<MenuWishlistItem[]> {
    return this.store.list(userId);
  }

  async addMenuWishlist(userId: string, input: MenuWishlistAddInput): Promise<MutationResult<MenuWishlistItem>> {
    this.store.assertUsable(userId);
    const parsedInput = MenuWishlistAddInputSchema.parse(input);

    const item = MenuWishlistItemSchema.parse({
      ...parsedInput,
      id: `mw-${generateId(16)}`,
      userId,
      createdAt: this.store.now().toISOString(),
    });

    const sync = await this.store.mutate(userId, { kind: 'upsert', data: item });
    return { data: item, sync };
  }

  async removeMenuWishlist(userId: string, id: string): Promise<MutationResult<{ id: string }>> {
    this.store.assertUsable(userId);
    if (!id) throw new Error('id menu wishlist wajib diisi.');
    const sync = await this.store.mutate(userId, { kind: 'delete', docId: id });
    return { data: { id }, sync };
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
