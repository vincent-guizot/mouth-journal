import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { userPreferencesRepository } from '../../src/repositories';
import { theme } from '../../src/config/theme';

type AppearanceMode = 'light' | 'dark' | 'system';

export default function AppearanceSettingsRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [mode, setMode] = useState<AppearanceMode>('light');

  useEffect(() => {
    if (currentUser?.uid) {
      (userPreferencesRepository as any)
        .getPreferences(currentUser.uid)
        .then((pref: any) => {
          if (pref.themeMode) setMode(pref.themeMode as AppearanceMode);
        })
        .catch(() => {});
    }
  }, [currentUser?.uid]);

  const handleSelectMode = async (selected: AppearanceMode) => {
    setMode(selected);
    if (currentUser?.uid) {
      await (userPreferencesRepository as any).updatePreferences(currentUser.uid, {
        themeMode: selected,
      });
    }
  };

  const THEMES: { id: AppearanceMode; title: string; subtitle: string; icon: any }[] = [
    {
      id: 'light',
      title: 'Light Mode (Warm Café)',
      subtitle: 'Nuansa krem hangat, terracotta, dan coffee brown.',
      icon: Sun,
    },
    {
      id: 'dark',
      title: 'Dark Mode (Espresso Night)',
      subtitle: 'Kenyamanan mata untuk pencatatan malam hari.',
      icon: Moon,
    },
    {
      id: 'system',
      title: 'Sesuai Sistem',
      subtitle: 'Mengikuti pengaturan tema perangkat Anda secara otomatis.',
      icon: Smartphone,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Pilih Tema Tampilan</Text>
        <View style={styles.list}>
          {THEMES.map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                onPress={() => handleSelectMode(item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    size={22}
                    color={isSelected ? theme.colors.terracotta : theme.colors.coffeeBrown}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EFE6DC',
    gap: 14,
  },
  themeCardSelected: {
    borderColor: theme.colors.terracotta,
    backgroundColor: '#FFFBF9',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A7569',
    lineHeight: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
