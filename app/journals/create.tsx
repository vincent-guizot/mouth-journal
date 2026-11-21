import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddLogScreen } from '../../src/screens/AddLogScreen';
import { useAuth } from '../../src/context/AuthContext';
import { parseJsonParam } from '../../src/navigation/routeParams';
import { PlaceSchema } from '../../src/schemas/placeSchema';
import { NotFoundState } from '../../src/components/feedback/NotFoundState';
import { theme } from '../../src/config/theme';

export default function JournalCreateRoute() {
  const router = useRouter();
  const { placeData } = useLocalSearchParams<{ placeData?: string }>();
  const { currentUser, isLoading } = useAuth();
  const parsedPlace = parseJsonParam(placeData, PlaceSchema);

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }
  if (parsedPlace.status === 'invalid') {
    return (
      <NotFoundState
        title="Data tempat tidak valid"
        message={`Tempat yang dikirim ke form tidak lolos validasi (${parsedPlace.reason}).`}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AddLogScreen
        initialPlace={parsedPlace.status === 'valid' ? parsedPlace.data : null}
        userId={currentUser.uid}
        userName={currentUser.displayName}
        onClose={() => router.back()}
        onSuccess={() => router.replace('/(tabs)/diary')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
});
