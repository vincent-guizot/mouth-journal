import React from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddLogScreen } from '../../../src/screens/AddLogScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { journalRepository } from '../../../src/repositories';
import { useJournalRecord } from '../../../src/features/diary/hooks/useJournalRecord';
import { NotFoundState } from '../../../src/components/feedback/NotFoundState';
import { parseIdParam, parseJournalInitialData } from '../../../src/navigation/routeParams';
import { theme } from '../../../src/config/theme';

export default function JournalEditRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ journalId: string; initialData?: string }>();
  const { currentUser, appMode } = useAuth();
  const journalId = parseIdParam(params.journalId);
  const { journal, status, error, reload } = useJournalRecord(
    currentUser?.uid,
    journalId,
    parseJournalInitialData(journalId, currentUser?.uid, params.initialData, appMode === 'demo')
  );

  if (status === 'loading' || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }
  if (status !== 'ready' || !journal) {
    return (
      <NotFoundState
        title={status === 'error' ? 'Jurnal gagal dimuat' : 'Jurnal tidak ditemukan atau sudah dihapus.'}
        message={status === 'error' ? error ?? undefined : undefined}
        onBack={() => router.back()}
        onRetry={status === 'error' ? reload : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AddLogScreen
        // Remount when the authoritative copy replaces the initialData copy.
        key={`${journal.id}-${journal.updatedAt ?? journal.createdAt}`}
        initialJournal={journal}
        userId={currentUser.uid}
        userName={currentUser.displayName}
        onClose={() => router.back()}
        onSuccess={() => router.replace('/(tabs)/diary')}
        onDelete={async () => {
          const { sync } = await journalRepository.deleteJournal(currentUser.uid, journal.id);
          if (sync === 'pending') Alert.alert('Jurnal Dihapus', 'Dihapus di perangkat; akan disinkronkan saat online.');
          router.replace('/(tabs)/diary');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
});
