import { FirestoreJournalRepository } from './journals/FirestoreJournalRepository';
import { FirestoreWishlistRepository } from './wishlist/FirestoreWishlistRepository';
import { FirestoreUserPreferencesRepository } from './user-preferences/FirestoreUserPreferencesRepository';
import { FirestoreUserProfileRepository } from './user-profile/FirestoreUserProfileRepository';
import { MockJournalRepository } from '../mocks/repositories/MockJournalRepository';
import { MockWishlistRepository } from '../mocks/repositories/MockWishlistRepository';
import { MockUserPreferencesRepository } from '../mocks/repositories/MockUserPreferencesRepository';
import { MockUserProfileRepository } from '../mocks/repositories/MockUserProfileRepository';
import { isFirebaseConfigured } from '../config/firebase';

export * from './journals/IJournalRepository';
export * from './journals/FirestoreJournalRepository';
export * from './wishlist/IWishlistRepository';
export * from './wishlist/FirestoreWishlistRepository';
export * from './user-preferences/IUserPreferencesRepository';
export * from './user-preferences/FirestoreUserPreferencesRepository';
export * from './user-profile/IUserProfileRepository';
export * from './user-profile/FirestoreUserProfileRepository';

/**
 * Repository Registry & Factory
 * Memungkinkan pergantian mulus antara Firebase dan Mock implementations
 */
const shouldUseMocks = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export const createRepositoryBundle = (useMock: boolean = shouldUseMocks) => {
  if (useMock) {
    return {
      journalRepository: new MockJournalRepository(),
      wishlistRepository: new MockWishlistRepository(),
      userPreferencesRepository: new MockUserPreferencesRepository(),
      userProfileRepository: new MockUserProfileRepository(),
    };
  }

  return {
    journalRepository: new FirestoreJournalRepository(),
    wishlistRepository: new FirestoreWishlistRepository(),
    userPreferencesRepository: new FirestoreUserPreferencesRepository(),
    userProfileRepository: new FirestoreUserProfileRepository(),
  };
};

const defaultBundle = createRepositoryBundle();

// Default exported singletons for application-wide consumption
export const journalRepository = defaultBundle.journalRepository;
export const wishlistRepository = defaultBundle.wishlistRepository;
export const userPreferencesRepository = defaultBundle.userPreferencesRepository;
export const userProfileRepository = defaultBundle.userProfileRepository;
