import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../config/firebase';
import { UserProfile } from '../../models/user';
import { UserProfileSchema } from '../../schemas/userSchema';
import { journalRepository, wishlistRepository, userPreferencesRepository, userProfileRepository } from '../../repositories';

export { UserProfile } from '../../models/user';

const USER_SESSION_KEY = '@mouthjournal_active_session';

export const DEMO_USER: UserProfile = {
  uid: 'user-vince-01',
  email: 'vincentia@example.com',
  displayName: 'Vincentia',
  username: 'vincentiaa',
  phoneNumber: '+62 812 3456 7890',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bannerURL: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
  bio: 'Food enthusiast & specialty coffee lover based in Jakarta. Always on the hunt for cozy aesthetic cafes with great brews.',
  culinaryPreferences: ['Kopi', 'Dessert', 'Makanan Berat'],
  favoriteVenueTypes: ['Café', 'Bakery', 'Hidden Gem'],
  budgetPerVisit: 'Rp 50.000 - 100.000',
  favoriteLocations: ['Jakarta Barat', 'Jakarta Selatan'],
  socialInstagram: 'vincentiaa',
  socialTikTok: 'vincentiaa',
};

export class AuthService {
  /**
   * Mengambil sesi pengguna saat ini (restorasi sesi)
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      // 1. Cek sesi lokal yang tersimpan
      const stored = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = UserProfileSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }

      // 2. Jika Firebase terhubung, cek currentUser
      if (isFirebaseConfigured && auth && auth.currentUser) {
        const u = auth.currentUser;
        const profile: UserProfile = {
          uid: u.uid,
          email: u.email || 'user@mouthjournal.com',
          displayName: u.displayName || u.email?.split('@')[0] || 'User',
          photoURL: u.photoURL || undefined,
        };
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        return profile;
      }

      // 3. Fallback demo HANYA saat pengembangan lokal (__DEV__)
      if (__DEV__) {
        return DEMO_USER;
      }

      return null;
    } catch {
      return __DEV__ ? DEMO_USER : null;
    }
  }

  /**
   * Login dengan Email & Password
   */
  static async login(email: string, pass: string): Promise<UserProfile> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) throw new Error('Email wajib diisi.');
    if (!pass) throw new Error('Kata sandi wajib diisi.');

    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const u = userCred.user;
        const profile: UserProfile = {
          uid: u.uid,
          email: u.email || trimmedEmail,
          displayName: u.displayName || trimmedEmail.split('@')[0],
          photoURL: u.photoURL || undefined,
        };
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        return profile;
      } catch (error: any) {
        throw new Error(error.message || 'Login gagal.');
      }
    }

    // Demo login jika Firebase belum diatur
    const profile: UserProfile = {
      uid: `user-${Date.now()}`,
      email: trimmedEmail,
      displayName: trimmedEmail.split('@')[0],
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    };
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    return profile;
  }

  /**
   * Pendaftaran Akun Baru
   */
  static async register(email: string, pass: string, displayName?: string): Promise<UserProfile> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) throw new Error('Email wajib diisi.');
    if (!pass || pass.length < 6) throw new Error('Kata sandi minimal 6 karakter.');

    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
        if (displayName && userCred.user) {
          await updateFirebaseProfile(userCred.user, { displayName });
        }
        const profile: UserProfile = {
          uid: userCred.user.uid,
          email: trimmedEmail,
          displayName: displayName || trimmedEmail.split('@')[0],
        };
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        return profile;
      } catch (error: any) {
        throw new Error(error.message || 'Pendaftaran gagal.');
      }
    }

    const profile: UserProfile = {
      uid: `user-${Date.now()}`,
      email: trimmedEmail,
      displayName: displayName || trimmedEmail.split('@')[0],
    };
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    return profile;
  }

  /**
   * Update Profile
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    const userId = current?.uid || 'user-vince-01';

    const merged: UserProfile = {
      ...(current || DEMO_USER),
      ...updates,
      uid: userId,
    };

    const validated = UserProfileSchema.parse(merged);
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(validated));

    // Sinkronkan ke repository profil
    try {
      await userProfileRepository.updateProfile(userId, validated);
    } catch {
      // Ignored if offline
    }

    return validated;
  }

  /**
   * Logout dengan pembersihan cache terisolasi
   */
  static async logout(): Promise<void> {
    const current = await this.getCurrentUser();
    const userId = current?.uid;

    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('[AuthService] SignOut error:', e);
      }
    }

    // Hapus sesi pengguna aktif
    await AsyncStorage.removeItem(USER_SESSION_KEY);

    // Bersihkan cache lokal spesifik pengguna agar tidak bocor ke akun berikutnya
    if (userId) {
      await Promise.all([
        journalRepository.clearUserCache(userId),
        wishlistRepository.clearUserCache(userId),
        userPreferencesRepository.clearUserCache(userId),
        userProfileRepository.clearUserCache(userId),
      ]);
    }
  }

  /**
   * Listener perubahan status autentikasi
   */
  static onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            photoURL: fbUser.photoURL || undefined,
          };
          callback(profile);
        } else {
          callback(null);
        }
      });
    }

    // Fallback jika Firebase belum diatur
    return () => {};
  }
}
