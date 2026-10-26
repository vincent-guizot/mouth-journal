import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../models/user';
import { UserLocation } from '../models/place';
import { AuthService } from '../services/firebase/authService';
import { LocationService } from '../services/places/locationService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  userLocation: UserLocation;
  setUserLocation: (location: UserLocation) => void;
  onboardingCompleted: boolean | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (email: string, pass: string, displayName?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUser: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: -6.229746,
  longitude: 106.816431,
  city: 'Jakarta Selatan',
  district: 'Senopati',
  address: 'Senopati, Jakarta Selatan',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const initSession = async () => {
    setIsLoading(true);
    try {
      // 1. Onboarding check
      const onboarded = await AsyncStorage.getItem('@mouthjournal_onboarding_completed');
      setOnboardingCompleted(onboarded === 'true');

      // 2. User profile check
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);

      // 3. User GPS location
      const loc = await LocationService.getCurrentLocation();
      if (loc) setUserLocation(loc);
    } catch (err) {
      console.warn('[AuthProvider] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await AuthService.login(email, pass);
    setCurrentUser(user);
    return user;
  };

  const register = async (email: string, pass: string, displayName?: string) => {
    const user = await AuthService.register(email, pass, displayName);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
  };

  const updateUser = async (profile: Partial<UserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...profile };
      setCurrentUser(updated);
      await AsyncStorage.setItem('@mouthjournal_active_session', JSON.stringify(updated));
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@mouthjournal_onboarding_completed', 'true');
    setOnboardingCompleted(true);
  };

  const refreshUser = async () => {
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        userLocation,
        setUserLocation,
        onboardingCompleted,
        login,
        register,
        logout,
        updateUser,
        completeOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
