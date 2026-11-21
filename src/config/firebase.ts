import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { appMode, rawFirebaseConfig } from './env';

export { appMode, validateFirebaseConfig, rawFirebaseConfig, DEMO_USER_ID } from './env';
export type { AppMode, FirebaseClientConfig } from './env';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

const createServices = (): FirebaseServices | null => {
  if (appMode !== 'firebase') {
    if (appMode === 'unconfigured') {
      console.error(
        '[Firebase] Konfigurasi Firebase tidak lengkap dan EXPO_PUBLIC_DEMO_MODE tidak aktif. ' +
          'Login dan sinkronisasi akan gagal secara eksplisit. Lihat .env.example.'
      );
    }
    return null;
  }

  const options: FirebaseOptions = {
    apiKey: rawFirebaseConfig.apiKey,
    authDomain: rawFirebaseConfig.authDomain,
    projectId: rawFirebaseConfig.projectId,
    storageBucket: rawFirebaseConfig.storageBucket,
    messagingSenderId: rawFirebaseConfig.messagingSenderId,
    appId: rawFirebaseConfig.appId,
  };

  const isFresh = getApps().length === 0;
  const app = isFresh ? initializeApp(options) : getApp();
  // On native, getAuth() in firebase@9 persists through the removed
  // ReactNative.AsyncStorage; initializeAuth with the community AsyncStorage keeps
  // the Firebase session across restarts. initializeAuth may only run once per app.
  const auth =
    Platform.OS === 'web' || !isFresh
      ? getAuth(app)
      : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

  return { app, auth, db: getFirestore(app), storage: getStorage(app) };
};

export const firebaseServices: FirebaseServices | null = createServices();

/** @deprecated use appMode === 'firebase'. Kept for call sites that only need a boolean. */
export const isFirebaseConfigured: boolean = firebaseServices !== null;
export const auth: Auth | null = firebaseServices?.auth ?? null;
export const db: Firestore | null = firebaseServices?.db ?? null;
export const storage: FirebaseStorage | null = firebaseServices?.storage ?? null;
