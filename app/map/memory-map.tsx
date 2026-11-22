import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { MemoryMapScreen } from '../../src/features/map-memory/MemoryMapScreen';
import { useAuth } from '../../src/context/AuthContext';
import { journalRepository } from '../../src/repositories';
import { aggregateVisitedPlaces, VisitedPlace } from '../../src/features/profile/profileAggregation';
import { theme } from '../../src/config/theme';

export default function MemoryMapRoute() {
  const router = useRouter();
  const { currentUser, userLocation, isLoading: authLoading } = useAuth();
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!currentUser?.uid) return;

    journalRepository
      .getJournals(currentUser.uid)
      .then((journals) => {
        if (active) {
          const places = aggregateVisitedPlaces(journals);
          setVisitedPlaces(places);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  if (authLoading || !currentUser) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <MemoryMapScreen
      visitedPlaces={visitedPlaces}
      userLocation={userLocation}
      loading={loading}
      onBack={() => router.back()}
      onViewJournals={(place) => {
        router.push({
          pathname: '/places/[placeId]',
          params: { placeId: place.placeId },
        });
      }}
      onAddJournal={(place) => {
        router.push({
          pathname: '/(tabs)/new',
          params: {
            placeId: place.placeId,
            placeName: place.placeName,
            placeAddress: place.placeAddress,
            subCategoryLabel: place.subCategoryLabel,
            mainCategory: place.mainCategory,
          },
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
