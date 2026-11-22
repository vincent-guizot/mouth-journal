import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CulinaryDigestScreen } from '../../src/features/analytics/CulinaryDigestScreen';
import { useAuth } from '../../src/context/AuthContext';
import { journalRepository } from '../../src/repositories';
import { Journal } from '../../src/models/journal';
import { theme } from '../../src/config/theme';

export default function CulinaryDigestRoute() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!currentUser?.uid) return;

    journalRepository
      .getJournals(currentUser.uid)
      .then((data) => {
        if (active) {
          setJournals(data);
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
    <CulinaryDigestScreen
      journals={journals}
      loading={loading}
      onBack={() => router.back()}
      onPlaceSelect={(placeId) => {
        router.push({
          pathname: '/places/[placeId]',
          params: { placeId },
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
