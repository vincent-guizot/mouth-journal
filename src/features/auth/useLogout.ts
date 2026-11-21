import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { PendingChangesError } from '../../services/firebase/authService';
import { feedback } from '../../components/feedback';

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
        feedback.showConfirm({
          title: 'Perubahan Belum Tersinkron',
          message: `${err.message} Hubungkan internet lalu coba lagi, atau buang perubahan tersebut.`,
          cancelText: 'Batal',
          confirmText: 'Buang & Keluar',
          destructive: true,
          onConfirm: async () => {
            try {
              await logout({ discardPending: true });
              finish();
            } catch (e) {
              feedback.showAlert('Gagal Keluar', e instanceof Error ? e.message : String(e));
            }
          },
        });
        return;
      }
      feedback.showAlert('Gagal Keluar', err instanceof Error ? err.message : String(err));
    }
  }, [logout, router]);
}
