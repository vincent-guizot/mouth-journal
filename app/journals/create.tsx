import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddLogScreen } from '../../src/screens/AddLogScreen';
import { useAuth } from '../../src/context/AuthContext';
import { NearbyPlace } from '../../src/types/places';
import { theme } from '../../src/config/theme';

export default function JournalCreateRoute() {
  const router = useRouter();
  const { placeData } = useLocalSearchParams<{ placeData?: string }>();
  const { currentUser, isLoading } = useAuth();

  let initialPlace: NearbyPlace | null = null;
  if (placeData) {
    try {
      initialPlace = JSON.parse(placeData);
    } catch {
      initialPlace = null;
    }
  }

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AddLogScreen
        initialPlace={initialPlace}
        userId={currentUser.uid}
        userName={currentUser.displayName || 'Me'}
        onClose={() => router.back()}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
