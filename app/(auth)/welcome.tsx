import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../src/screens/OnboardingScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function WelcomeRoute() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <OnboardingScreen onComplete={handleComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
