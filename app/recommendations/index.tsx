import React from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AIRecommendationsScreen } from '../../src/screens/AIRecommendationsScreen';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function RecommendationsRoute() {
  const router = useRouter();
  const { currentUser, userLocation, isLoading } = useAuth();

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <AIRecommendationsScreen
      userId={currentUser.uid}
      userLocation={userLocation}
      onBack={() => router.back()}
      onOpenExplore={() => router.replace('/(tabs)/explore')}
      onPlaceSelect={(place) => {
        router.push({
          pathname: '/places/[placeId]',
          params: { placeId: place.id, initialData: JSON.stringify(place) },
        });
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
