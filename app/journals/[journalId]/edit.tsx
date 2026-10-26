import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EditJournalScreen } from '../../../src/screens/EditJournalScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { journalRepository } from '../../../src/repositories';
import { DiaryEntry } from '../../../src/types/diary';
import { theme } from '../../../src/config/theme';

export default function JournalEditRoute() {
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
      <EditJournalScreen
        journal={journal}
        onBack={() => router.back()}
        onSave={async (updated) => {
          if (currentUser?.uid && updated.id) {
            await journalRepository.updateJournal(currentUser.uid, updated.id, updated as any);
          }
          router.back();
        }}
        onDelete={async (id) => {
          if (currentUser?.uid) {
            await journalRepository.deleteJournal(currentUser.uid, id);
          }
          router.replace('/(tabs)/diary');
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
