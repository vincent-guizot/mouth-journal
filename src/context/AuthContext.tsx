import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../models/user';
import { UserLocation } from '../models/place';
import { AppMode, appMode } from '../config/firebase';
import { authService, DeleteAccountReport, SessionUser } from '../services/firebase/authService';
import { LocationService, DEFAULT_FALLBACK_LOCATION } from '../services/places/locationService';

const ONBOARDING_KEY = '@mouthjournal_onboarding_completed';

interface AuthContextType {
  appMode: AppMode;
  /** Verified identity from Firebase Auth (or the explicit demo session). */
  session: SessionUser | null;
  /** Firestore profile merged with the auth identity. */
  currentUser: UserProfile | null;
  isLoading: boolean;
  /** Error while loading the profile/session; shown instead of faking a user. */
  authError: string | null;
  userLocation: UserLocation;
  setUserLocation: (location: UserLocation) => void;
  isRefreshingLocation: boolean;
  refreshUserLocation: () => Promise<void>;
  onboardingCompleted: boolean | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: (options?: { discardPending?: boolean }) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<{ emailVerificationSentTo?: string }>;
  deleteAccount: (password: string) => Promise<DeleteAccountReport>;
  completeOnboarding: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackProfile = (s: SessionUser): UserProfile => ({
  uid: s.uid,
  email: s.email,
  displayName: s.displayName,
  photoURL: s.photoURL,
  culinaryPreferences: [],
  favoriteVenueTypes: [],
  favoriteLocations: [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_FALLBACK_LOCATION);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const sessionRef = useRef<SessionUser | null>(null);

  const loadProfile = useCallback(async (s: SessionUser | null) => {
    sessionRef.current = s;
    setSession(s);
    if (!s) {
      setCurrentUser(null);
      setAuthError(null);
      return;
    }
    try {
      const profile = await authService.ensureProfile(s);
      if (sessionRef.current?.uid === s.uid) {
        setCurrentUser(profile);
        setAuthError(null);
      }
    } catch (err) {
      // The identity is real; only the profile document could not be loaded.
      // Show the auth identity and surface the real error.
      if (sessionRef.current?.uid === s.uid) {
        setCurrentUser(fallbackProfile(s));
        setAuthError(`Profil gagal dimuat: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => setOnboardingCompleted(v === 'true'))
      .catch((err) => {
        console.warn('[AuthProvider] Gagal membaca status onboarding:', err);
        setOnboardingCompleted(false);
      });

    const unsubscribe = authService.subscribe(
      (s) => {
        loadProfile(s).finally(() => setAuthResolved(true));
      },
      (err) => setAuthError(err instanceof Error ? err.message : String(err))
    );
    return unsubscribe;
  }, [loadProfile]);

  const refreshUserLocation = useCallback(async () => {
    setIsRefreshingLocation(true);
    try {
      setUserLocation(await LocationService.getCurrentLocation());
    } finally {
      setIsRefreshingLocation(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    LocationService.getCurrentLocation().then((loc) => active && setUserLocation(loc));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      appMode,
      session,
      currentUser,
      isLoading: !authResolved || onboardingCompleted === null,
      authError,
      userLocation,
      setUserLocation,
      isRefreshingLocation,
      refreshUserLocation,
      onboardingCompleted,
      login: async (email, pass) => {
        const s = await authService.login(email, pass);
        await loadProfile(s);
      },
      register: async (email, pass, displayName) => {
        const s = await authService.register(email, pass, displayName);
        await loadProfile(s);
      },
      sendPasswordReset: (email) => authService.sendPasswordReset(email),
      logout: async (options) => {
        await authService.logout(options);
        await loadProfile(null);
      },
      updateProfile: async (patch) => {
        if (!session) throw new Error('Tidak ada sesi login.');
        const result = await authService.updateAccountProfile(session.uid, patch);
        setCurrentUser(result.profile);
        return { emailVerificationSentTo: result.emailVerificationSentTo };
      },
      deleteAccount: async (password) => {
        const report = await authService.deleteAccount(password);
        await loadProfile(null);
        return report;
      },
      completeOnboarding: async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setOnboardingCompleted(true);
      },
      refreshUser: async () => {
        await loadProfile(await authService.getCurrentSession());
      },
    }),
    [session, currentUser, authResolved, authError, userLocation, isRefreshingLocation, refreshUserLocation, onboardingCompleted, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
