import { appMode, db } from '../config/firebase';
import { asyncStorageKv } from '../storage/asyncStorageKv';
import { createRepositoryBundle } from './createRepositories';

export * from './journals/IJournalRepository';
export * from './journals/FirestoreJournalRepository';
export * from './wishlist/IWishlistRepository';
export * from './wishlist/FirestoreWishlistRepository';
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
export const repositories = createRepositoryBundle({ mode: appMode, db, kv: asyncStorageKv });

export const journalRepository = repositories.journalRepository;
export const wishlistRepository = repositories.wishlistRepository;
export const userPreferencesRepository = repositories.userPreferencesRepository;
export const userProfileRepository = repositories.userProfileRepository;
