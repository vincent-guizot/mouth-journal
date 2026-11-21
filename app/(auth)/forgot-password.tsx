import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthModal } from '../../src/screens/AuthModal';
import { theme } from '../../src/config/theme';

export default function ForgotPasswordRoute() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AuthModal
        initialStep="forgot_password"
        onSuccess={() => router.replace('/(tabs)/diary')}
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
