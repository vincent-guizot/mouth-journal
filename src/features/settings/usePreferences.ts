import { useCallback, useEffect, useState } from 'react';
import { AppSettings } from '../../models/preferences';
import { PreferencesPatch } from '../../schemas/preferencesSchema';
import { userPreferencesRepository } from '../../repositories';
import { feedback } from '../../components/feedback';

/** Typed settings state; every patch is merged by the repository in one write. */
export function usePreferences(userId: string | undefined) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    userPreferencesRepository
      .getSettings(userId)
      .then((s) => active && setSettings(s))
      .catch((err) => active && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      active = false;
    };
  }, [userId]);

  const update = useCallback(
    async (patch: PreferencesPatch) => {
      if (!userId) return;
      try {
        const { data, sync } = await userPreferencesRepository.updatePreferences(userId, patch);
        setSettings(data);
        if (sync === 'pending') {
          feedback.showToast('Preferensi akan disinkronkan saat online.', 'info');
        }
      } catch (err) {
        feedback.showAlert('Gagal Menyimpan Preferensi', err instanceof Error ? err.message : String(err));
      }
    },
    [userId]
  );

  return { settings, error, update };
}
