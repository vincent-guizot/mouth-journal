import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, resolveIsDark, ThemeType, theme as defaultLightTheme } from '../config/theme';

export type AppearanceMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeType;
  mode: AppearanceMode;
  isDark: boolean;
  setMode: (mode: AppearanceMode) => Promise<void>;
}

const STORAGE_KEY = '@mouthjournal_appearance_mode';

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultLightTheme,
  mode: 'system',
  isDark: false,
  setMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>('system');

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (!isMounted) return;
        if (val === 'light' || val === 'dark' || val === 'system') {
          setModeState(val);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback(async (newMode: AppearanceMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  }, []);

  const isDark = useMemo(() => resolveIsDark(mode, systemColorScheme), [mode, systemColorScheme]);
  const activeTheme = useMemo(() => getTheme(mode, systemColorScheme === 'dark'), [mode, systemColorScheme]);

  const value = useMemo(
    () => ({
      theme: activeTheme,
      mode,
      isDark,
      setMode,
    }),
    [activeTheme, mode, isDark, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
