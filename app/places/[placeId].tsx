import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailPlaceScreen } from '../../src/screens/DetailPlaceScreen';
import { useAuth } from '../../src/context/AuthContext';
import { usePlaceRecord } from '../../src/features/places/usePlaceRecord';
import { NotFoundState } from '../../src/components/feedback/NotFoundState';
import { parseIdParam, parsePlaceInitialData } from '../../src/navigation/routeParams';
import { theme } from '../../src/config/theme';

export default function PlaceDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId: string; initialData?: string }>();
  const { currentUser } = useAuth();
  const placeId = parseIdParam(params.placeId);
  const initial = useMemo(() => parsePlaceInitialData(placeId, params.initialData), [placeId, params.initialData]);
  const { place, status, error, reload, isWishlisted, toggleWishlist } = usePlaceRecord(currentUser?.uid, placeId, initial);

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }
  if (status !== 'ready' || !place) {
    return (
      <NotFoundState
        title={
          status === 'invalid' ? 'Tautan tempat tidak valid' : status === 'error' ? 'Detail tempat gagal dimuat' : 'Tempat tidak ditemukan'
        }
        message={
          status === 'error'
            ? error ?? undefined
            : status === 'not_found'
            ? 'Tempat ini tidak ada di OpenStreetMap atau merupakan tempat manual tanpa data detail.'
            : undefined
        }
        onBack={() => router.back()}
        onRetry={status === 'error' ? reload : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <DetailPlaceScreen
        place={place}
        isWishlisted={isWishlisted}
        onBack={() => router.back()}
        onWriteJournal={(p) => router.push({ pathname: '/journals/create', params: { placeData: JSON.stringify(p) } })}
        onToggleWishlist={toggleWishlist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
});
