import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthModal } from '../../src/screens/AuthModal';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function RegisterRoute() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  return (
    <View style={styles.container}>
      <AuthModal
        initialStep="register"
        onSuccess={async () => {
          await refreshUser();
          router.replace('/(tabs)/diary');
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
