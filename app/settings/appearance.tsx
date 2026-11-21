import React from 'react';
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
import { usePreferences } from '../../src/features/settings/usePreferences';
import { theme } from '../../src/config/theme';

type AppearanceMode = 'light' | 'dark' | 'system';

export default function AppearanceSettingsRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { settings, update } = usePreferences(currentUser?.uid);
  const mode: AppearanceMode = settings?.appearance ?? 'light';
  // Only the light theme is implemented in the UI; dark/system are shown disabled
  // instead of pretending to switch the theme.
  const handleSelectMode = (selected: AppearanceMode) => {
    if (selected !== 'light') return;
    update({ appearance: selected });
  };

  const THEMES: { id: AppearanceMode; title: string; subtitle: string; icon: typeof Sun; available: boolean }[] = [
    {
      id: 'light',
      title: 'Light Mode (Warm Café)',
      subtitle: 'Nuansa krem hangat, terracotta, dan coffee brown.',
      icon: Sun,
      available: true,
    },
    {
      id: 'dark',
      title: 'Dark Mode (Espresso Night)',
      subtitle: 'Kenyamanan mata untuk pencatatan malam hari.',
      icon: Moon,
      available: false,
    },
    {
      id: 'system',
      title: 'Sesuai Sistem',
      subtitle: 'Mengikuti pengaturan tema perangkat Anda secara otomatis.',
      icon: Smartphone,
      available: false,
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
                style={[styles.themeCard, isSelected && styles.themeCardSelected, !item.available && { opacity: 0.45 }]}
                disabled={!item.available}
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
                  <Text style={styles.subtitle}>{item.available ? item.subtitle : 'Belum tersedia di versi ini.'}</Text>
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
