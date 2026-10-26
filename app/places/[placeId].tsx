import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailPlaceScreen } from '../../src/screens/DetailPlaceScreen';
import { useAuth } from '../../src/context/AuthContext';
import { placesService } from '../../src/services/places/placesService';
import { wishlistRepository } from '../../src/repositories';
import { NearbyPlace } from '../../src/types/places';
import { theme } from '../../src/config/theme';

export default function PlaceDetailRoute() {
  const router = useRouter();
  const { placeId, initialData } = useLocalSearchParams<{
    placeId: string;
    initialData?: string;
  }>();
  const { currentUser } = useAuth();
  const [place, setPlace] = useState<NearbyPlace | null>(() => {
    if (initialData) {
      try {
        return JSON.parse(initialData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!place);

  useEffect(() => {
    if (!place && placeId) {
      setIsLoading(true);
      placesService
        .getPlaceDetails(placeId)
        .then((p: any) => {
          if (p) setPlace(p as unknown as NearbyPlace);
        })
        .finally(() => setIsLoading(false));
    }
  }, [placeId]);

  if (isLoading || !place) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DetailPlaceScreen
        place={place}
        onBack={() => router.back()}
        onWriteJournal={(p) => {
          router.push({
            pathname: '/journals/create',
            params: { placeData: JSON.stringify(p) },
          });
        }}
        onToggleWishlist={async (p) => {
          if (currentUser?.uid) {
            await wishlistRepository.addToWishlist(currentUser.uid, {
              placeId: p.id,
              placeName: p.name,
              placeAddress: p.address || '',
              mainCategory: p.mainCategory,
              subCategory: p.subCategoryLabel || p.subCategory || 'Cafe',
              ratingAverage: p.ratingAverage || 4.5,
              photoUrl: p.photoUrl,
              latitude: p.latitude,
              longitude: p.longitude,
            });
          }
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
