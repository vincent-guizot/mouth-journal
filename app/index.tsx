import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { SplashScreen } from '../src/screens/SplashScreen';
import { theme } from '../src/config/theme';

export default function IndexGatekeeper() {
  const { currentUser, isLoading, onboardingCompleted } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);

  // 1. Tampilkan Animated Splash Screen pertama kali
  if (!splashFinished) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  // 2. Loading state dari Auth Context
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  // 3. Jika belum pernah onboarding, arahkan ke welcome/onboarding
  if (onboardingCompleted === false) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // 4. Jika belum login, arahkan ke login
  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // 5. Default: masuk ke tab utama (Diary)
  return <Redirect href="/(tabs)/diary" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
