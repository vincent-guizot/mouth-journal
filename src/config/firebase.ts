import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Baca konfigurasi dari environment EXPO_PUBLIC_*
export const rawFirebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validasi apakah konfigurasi Firebase lengkap dan valid (bukan placeholder kosong)
 */
export const validateFirebaseConfig = (config: FirebaseClientConfig): boolean => {
  return !!(
    config.apiKey &&
    config.apiKey.length > 10 &&
    !config.apiKey.includes('DEMO_KEY') &&
    config.projectId &&
    !config.projectId.includes('placeholder')
  );
};

export const isFirebaseConfigured: boolean = validateFirebaseConfig(rawFirebaseConfig);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured && rawFirebaseConfig.apiKey && rawFirebaseConfig.projectId) {
  try {
    const options: FirebaseOptions = {
      apiKey: rawFirebaseConfig.apiKey,
      authDomain: rawFirebaseConfig.authDomain,
      projectId: rawFirebaseConfig.projectId,
      storageBucket: rawFirebaseConfig.storageBucket,
      messagingSenderId: rawFirebaseConfig.messagingSenderId,
      appId: rawFirebaseConfig.appId,
    };

    appInstance = getApps().length === 0 ? initializeApp(options) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
  } catch (err) {
    console.warn('[Firebase] Gagal menginisialisasi instance Firebase:', err);
    appInstance = null;
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
  }
} else {
  // Hanya log informasi di mode pengembangan jika Firebase belum diatur
  if (__DEV__) {
    console.info(
      '[Firebase] Mode Lokal/Offline aktif. Kunci Firebase belum diatur di .env (lihat .env.example).'
    );
  }
}

export const app: FirebaseApp | null = appInstance;
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;
export const storage: FirebaseStorage | null = storageInstance;
