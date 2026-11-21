import { FirestoreJournalRepository } from './journals/FirestoreJournalRepository';
import { FirestoreWishlistRepository } from './wishlist/FirestoreWishlistRepository';
import { FirestoreUserPreferencesRepository } from './user-preferences/FirestoreUserPreferencesRepository';
import { FirestoreUserProfileRepository } from './user-profile/FirestoreUserProfileRepository';
import { RepositoryDeps } from './sync/types';

/** Pure factory (no React Native imports) so tests build the exact production classes. */
export const createRepositoryBundle = (deps: RepositoryDeps) => ({
  journalRepository: new FirestoreJournalRepository(deps),
  wishlistRepository: new FirestoreWishlistRepository(deps),
  userPreferencesRepository: new FirestoreUserPreferencesRepository(deps),
  userProfileRepository: new FirestoreUserProfileRepository(deps),
});

export type RepositoryBundle = ReturnType<typeof createRepositoryBundle>;
