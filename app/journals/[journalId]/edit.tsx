import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddLogScreen } from '../../../src/screens/AddLogScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { journalRepository } from '../../../src/repositories';
import { Journal } from '../../../src/models/journal';
import { theme } from '../../../src/config/theme';

export default function JournalEditRoute() {
  const router = useRouter();
  const { journalId, initialData } = useLocalSearchParams<{
    journalId: string;
    initialData?: string;
  }>();
  const { currentUser } = useAuth();
  const [journal, setJournal] = useState<Journal | null>(() => {
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
            setJournal(fetched);
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

  if (!journal) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Jurnal tidak ditemukan atau sudah dihapus.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AddLogScreen
        initialJournal={journal}
        userId={currentUser?.uid || ''}
        userName={currentUser?.displayName || 'Me'}
        onClose={() => router.back()}
        onSuccess={() => router.replace('/(tabs)/diary')}
        onDelete={async () => {
          if (currentUser?.uid && journal?.id) {
            await journalRepository.deleteJournal(currentUser.uid, journal.id);
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
  notFoundText: { color: theme.colors.textSecondary, marginBottom: 14 },
  backButton: { backgroundColor: theme.colors.terracotta, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
