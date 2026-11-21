import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthModal } from '../../src/screens/AuthModal';
import { theme } from '../../src/config/theme';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AuthModal
        initialStep="login"
        onSuccess={() => router.replace('/(tabs)/diary')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
