import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { PendingChangesError } from '../../services/firebase/authService';

/**
 * Logout that never silently drops unsynced journal/wishlist changes: if the
 * repository queue is not empty after a sync attempt, the user must explicitly
 * choose to discard them.
 */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return useCallback(async () => {
    const finish = () => router.replace('/(auth)/login');
    try {
      await logout();
      finish();
    } catch (err) {
      if (err instanceof PendingChangesError) {
        Alert.alert('Perubahan Belum Tersinkron', `${err.message} Hubungkan internet lalu coba lagi, atau buang perubahan tersebut.`, [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Buang & Keluar',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout({ discardPending: true });
                finish();
              } catch (e) {
                Alert.alert('Gagal Keluar', e instanceof Error ? e.message : String(e));
              }
            },
          },
        ]);
        return;
      }
      Alert.alert('Gagal Keluar', err instanceof Error ? err.message : String(err));
    }
  }, [logout, router]);
}
