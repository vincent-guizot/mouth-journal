import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailPlaceScreen } from '../../src/screens/DetailPlaceScreen';
import { useAuth } from '../../src/context/AuthContext';
import { wishlistRepository } from '../../src/repositories';
import { NearbyPlace } from '../../src/types/places';
import { theme } from '../../src/config/theme';

export default function WishlistItemDetailRoute() {
  const router = useRouter();
  const { itemId, initialData } = useLocalSearchParams<{
    itemId: string;
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
    if (!place && currentUser?.uid && itemId) {
      setIsLoading(true);
      wishlistRepository
        .getWishlist(currentUser.uid)
        .then((items) => {
          const found = items.find((it) => it.id === itemId);
          if (found) {
            const mappedPlace: NearbyPlace = {
              id: found.placeId || found.id,
              name: found.placeName,
              address: found.placeAddress,
              mainCategory: found.mainCategory || 'food',
              mainCategoryLabel: found.mainCategory === 'drinks' ? 'Minuman' : 'Kuliner',
              subCategory: found.subCategory || 'Cafe',
              subCategoryLabel: found.subCategory || 'Cafe',
              latitude: found.latitude || -6.229746,
              longitude: found.longitude || 106.816431,
              photoUrl: found.photoUrl,
              ratingAverage: found.ratingAverage || 4.5,
            };
            setPlace(mappedPlace);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [itemId, currentUser?.uid]);

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
        onToggleWishlist={async () => {
          if (currentUser?.uid && itemId) {
            await wishlistRepository.removeFromWishlist(currentUser.uid, itemId);
            router.back();
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
