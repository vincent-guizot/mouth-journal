import { appMode, db, storage } from '../config/firebase';
import { asyncStorageKv } from '../storage/asyncStorageKv';
import { createRepositoryBundle } from './createRepositories';

export * from './journals/IJournalRepository';
export * from './journals/FirestoreJournalRepository';
export * from './wishlist/IWishlistRepository';
export * from './wishlist/FirestoreWishlistRepository';
export * from './menu-wishlist/IMenuWishlistRepository';
export * from './menu-wishlist/FirestoreMenuWishlistRepository';
export * from './user-preferences/IUserPreferencesRepository';
export * from './user-preferences/FirestoreUserPreferencesRepository';
export * from './user-profile/IUserProfileRepository';
export * from './user-profile/FirestoreUserProfileRepository';
export * from './sync/types';
export { createRepositoryBundle } from './createRepositories';
export type { RepositoryBundle } from './createRepositories';

/**
 * App-wide singletons. In 'firebase' mode they talk to Firestore; in explicit
 * 'demo' mode they are local-only; in 'unconfigured' mode every call fails loudly.
 */
export const repositories = createRepositoryBundle({ mode: appMode, db, storage, kv: asyncStorageKv });

export const journalRepository = repositories.journalRepository;
export const wishlistRepository = repositories.wishlistRepository;
export const menuWishlistRepository = repositories.menuWishlistRepository;
export const userPreferencesRepository = repositories.userPreferencesRepository;
export const userProfileRepository = repositories.userProfileRepository;
