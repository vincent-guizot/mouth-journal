import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function SettingsIndexRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <SettingsScreen
        onBack={() => router.back()}
        onLogout={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
        onShowOnboarding={() => {
          router.push('/(auth)/welcome');
        }}
        onNavigateCategory={(category) => {
          if (category === 'account') router.push('/settings/account');
          else if (category === 'location') router.push('/settings/location');
          else if (category === 'appearance') router.push('/settings/appearance');
          else if (category === 'preferences') router.push('/settings/food-preferences');
          else if (category === 'data') router.push('/settings/data-support');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
