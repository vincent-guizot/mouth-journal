import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AIRecommendationsScreen } from '../../src/screens/AIRecommendationsScreen';
import { theme } from '../../src/config/theme';

export default function RecommendationsRoute() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AIRecommendationsScreen
        onBack={() => router.back()}
        onPlaceSelect={(place) => {
          router.push({
            pathname: '/places/[placeId]',
            params: {
              placeId: place.id,
              initialData: JSON.stringify(place),
            },
          });
        }}
        onOpenItinerary={(itineraryId) => {
          // Future AI Itinerary exploration
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
