import { deleteApp, initializeApp, FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, Auth, signOut } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, FirebaseStorage, getStorage } from 'firebase/storage';

export const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-mouthjournal';
export const BUCKET = `${PROJECT_ID}.appspot.com`;
export const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
export const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
export const STORAGE_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';

const [fsHost, fsPort] = FIRESTORE_HOST.split(':');
const [stHost, stPort] = STORAGE_HOST.split(':');

export interface ClientHandle {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  dispose(): Promise<void>;
}

let counter = 0;

/** A real Firebase client SDK instance wired to the local emulators. */
export const createClient = (): ClientHandle => {
  const app = initializeApp(
    { apiKey: 'demo-api-key', projectId: PROJECT_ID, storageBucket: BUCKET, appId: '1:1:web:1', authDomain: `${PROJECT_ID}.firebaseapp.com` },
    `test-${process.pid}-${++counter}`
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, fsHost, Number(fsPort));
  const storage = getStorage(app);
  connectStorageEmulator(storage, stHost, Number(stPort));
  return {
    app,
    auth,
    db,
    storage,
    async dispose() {
      await signOut(auth).catch(() => undefined);
      await deleteApp(app);
    },
  };
};

export const uniqueEmail = (label: string) => `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

export const signUp = async (client: ClientHandle, label: string, password = 'Passw0rd!') => {
  const email = uniqueEmail(label);
  const cred = await createUserWithEmailAndPassword(client.auth, email, password);
  return { uid: cred.user.uid, email, password };
};

/** Emulator REST helpers. */
export const clearFirestore = () =>
  fetch(`http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: 'DELETE' });

export const clearAuth = () => fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' });

export const getOobCodes = async (): Promise<{ email: string; requestType: string; oobCode: string }[]> => {
  const res = await fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/oobCodes`);
  const json = (await res.json()) as { oobCodes: { email: string; requestType: string; oobCode: string }[] };
  return json.oobCodes;
};

export const validJournalDraft = (overrides: Record<string, unknown> = {}) => ({
  placeId: 'osm-node-123',
  placeName: 'Kopi Test',
  placeAddress: 'Jl. Test No. 1, Jakarta',
  mainCategory: 'drinks' as const,
  subCategory: 'kopi',
  subCategoryLabel: 'Kopi/Cafe',
  latitude: -6.2297,
  longitude: 106.8164,
  photoUrls: [] as string[],
  overallRating: 3.8,
  criteriaRating: { taste: 5, ambiance: 4, service: 3, price: 3 },
  menuItems: [{ id: 'm1', name: 'Latte', price: 35000, rating: 5 }],
  totalSpent: 35000,
  reviewText: 'Enak',
  tags: ['Kopi/Cafe'],
  visitedAt: new Date(Date.now() - 3600_000).toISOString(),
  ...overrides,
});

export const placeInput = (placeId = 'osm-node-555') => ({
  placeId,
  placeName: 'Bakery Test',
  placeAddress: '',
  mainCategory: 'food' as const,
  subCategory: 'bakery',
  subCategoryLabel: 'Bakery & Pastry',
  latitude: -6.21,
  longitude: 106.82,
});
