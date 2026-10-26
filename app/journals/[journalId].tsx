import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailJournalScreen } from '../../src/screens/DetailJournalScreen';
import { useAuth } from '../../src/context/AuthContext';
import { journalRepository } from '../../src/repositories';
import { DiaryEntry } from '../../src/types/diary';
import { theme } from '../../src/config/theme';

export default function JournalDetailRoute() {
  const router = useRouter();
  const { journalId, initialData } = useLocalSearchParams<{
    journalId: string;
    initialData?: string;
  }>();
  const { currentUser } = useAuth();
  const [journal, setJournal] = useState<DiaryEntry | null>(() => {
    if (initialData) {
      try {
        return JSON.parse(initialData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!journal);

  useEffect(() => {
    if (!journal && currentUser?.uid && journalId) {
      setIsLoading(true);
      journalRepository
        .getJournalById(currentUser.uid, journalId)
        .then((fetched) => {
          if (fetched) {
            setJournal(fetched as unknown as DiaryEntry);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [journalId, currentUser?.uid]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DetailJournalScreen
        journal={journal}
        onBack={() => router.back()}
        onEdit={(entry) => {
          router.push({
            pathname: '/journals/[journalId]/edit',
            params: {
              journalId: entry.id,
              initialData: JSON.stringify(entry),
            },
          });
        }}
        onOpenMap={() => router.push('/(tabs)/explore')}
        onOpenPlaceDetail={() => {
          if (journal?.placeId) {
            router.push({
              pathname: '/places/[placeId]',
              params: { placeId: journal.placeId },
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
