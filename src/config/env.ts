/**
 * Pure environment/config resolution. No React Native or Firebase imports here so
 * the same logic can be imported from Node tests.
 *
 * App modes:
 *  - 'firebase'     : Firebase config is complete. Auth/Firestore/Storage are real.
 *  - 'demo'         : EXPO_PUBLIC_DEMO_MODE=true. Explicit local-only mode with one
 *                     stable local UID. Data never leaves the device.
 *  - 'unconfigured' : Neither. Every auth/data operation fails with a clear error;
 *                     nothing is faked.
 */

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export type AppMode = 'firebase' | 'demo' | 'unconfigured';

/** Stable local identity for explicit demo mode. Never regenerated per login. */
export const DEMO_USER_ID = 'local-demo-user';

export const validateFirebaseConfig = (config: FirebaseClientConfig): boolean =>
  Boolean(
    config.apiKey &&
      config.apiKey.length > 10 &&
      !config.apiKey.includes('DEMO_KEY') &&
      config.projectId &&
      !config.projectId.includes('placeholder') &&
      config.appId &&
      config.storageBucket
  );

export const resolveAppMode = (input: {
  demoModeFlag: string | undefined;
  firebaseConfig: FirebaseClientConfig;
}): AppMode => {
  if (input.demoModeFlag === 'true') return 'demo';
  return validateFirebaseConfig(input.firebaseConfig) ? 'firebase' : 'unconfigured';
};

// Expo inlines EXPO_PUBLIC_* only for literal `process.env.EXPO_PUBLIC_X` accesses.
export const rawFirebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const appMode: AppMode = resolveAppMode({
  demoModeFlag: process.env.EXPO_PUBLIC_DEMO_MODE,
  firebaseConfig: rawFirebaseConfig,
});

export const osmConfig = {
  overpassUrl: process.env.EXPO_PUBLIC_OSM_OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
  nominatimUrl: process.env.EXPO_PUBLIC_OSM_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  /** Identifies the app to OSM services per their usage policy. */
  userAgent: process.env.EXPO_PUBLIC_OSM_USER_AGENT || 'MouthJournal/1.0.0 (Expo app)',
};
