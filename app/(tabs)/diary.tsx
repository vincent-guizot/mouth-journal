import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DiaryScreen } from '../../src/screens/DiaryScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function DiaryTabRoute() {
  const router = useRouter();
  const { currentUser, userLocation, isLoading } = useAuth();

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DiaryScreen
        userId={currentUser.uid}
        userLocation={userLocation}
        onJournalSelect={(journal) => {
          router.push({
            pathname: '/journals/[journalId]',
            params: { journalId: journal.id, initialData: JSON.stringify(journal) },
          });
        }}
        onPlaceSelect={(place) => {
          router.push({
            pathname: '/places/[placeId]',
            params: { placeId: place.id, initialData: JSON.stringify(place) },
          });
        }}
        onAddLog={() => {
          router.push('/journals/create');
        }}
        onOpenMap={() => {
          router.push('/(tabs)/explore');
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
