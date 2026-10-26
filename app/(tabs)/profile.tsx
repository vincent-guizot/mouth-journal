import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function ProfileTabRoute() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileScreen
        user={currentUser}
        onLogout={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
        onOpenSettings={() => {
          router.push('/settings');
        }}
        onEditProfile={() => {
          router.push('/profile/edit');
        }}
        onOpenAIRecommendations={() => {
          router.push('/recommendations');
        }}
        onJournalSelect={(journal) => {
          router.push({
            pathname: '/journals/[journalId]',
            params: { journalId: journal.id, initialData: JSON.stringify(journal) },
          });
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
