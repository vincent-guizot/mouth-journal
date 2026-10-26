import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ExploreScreen } from '../../src/screens/ExploreScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function ExploreTabRoute() {
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
      <ExploreScreen
        userId={currentUser.uid}
        userLocation={userLocation}
        onPlaceSelect={(place) => {
          router.push({
            pathname: '/places/[placeId]',
            params: { placeId: place.id, initialData: JSON.stringify(place) },
          });
        }}
        onAddDiaryForPlace={(place) => {
          router.push({
            pathname: '/journals/create',
            params: { placeData: JSON.stringify(place) },
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
