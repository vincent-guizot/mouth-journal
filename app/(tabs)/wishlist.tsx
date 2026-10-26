import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WishlistScreen } from '../../src/screens/WishlistScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function WishlistTabRoute() {
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
      <WishlistScreen
        userId={currentUser.uid}
        userLocation={userLocation}
        onPlaceSelect={(place) => {
          router.push({
            pathname: '/places/[placeId]',
            params: { placeId: place.id, initialData: JSON.stringify(place) },
          });
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
