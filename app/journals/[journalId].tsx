import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DetailJournalScreen } from '../../src/screens/DetailJournalScreen';
import { useAuth } from '../../src/context/AuthContext';
import { useJournalRecord } from '../../src/features/diary/hooks/useJournalRecord';
import { NotFoundState } from '../../src/components/feedback/NotFoundState';
import { parseIdParam, parseJournalInitialData } from '../../src/navigation/routeParams';
import { theme } from '../../src/config/theme';

export default function JournalDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ journalId: string; initialData?: string }>();
  const { currentUser, appMode } = useAuth();
  const journalId = parseIdParam(params.journalId);
  const { journal, status, error, reload } = useJournalRecord(
    currentUser?.uid,
    journalId,
    parseJournalInitialData(journalId, currentUser?.uid, params.initialData, appMode === 'demo')
  );

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }
  if (status !== 'ready' || !journal) {
    return (
      <NotFoundState
        title={status === 'invalid' ? 'Tautan jurnal tidak valid' : status === 'error' ? 'Jurnal gagal dimuat' : 'Jurnal tidak ditemukan'}
        message={status === 'error' ? error ?? undefined : 'Jurnal mungkin sudah dihapus atau bukan milik akun ini.'}
        onBack={() => router.back()}
        onRetry={status === 'error' ? reload : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <DetailJournalScreen
        journal={journal}
        onBack={() => router.back()}
        onEdit={(entry) =>
          router.push({ pathname: '/journals/[journalId]/edit', params: { journalId: entry.id, initialData: JSON.stringify(entry) } })
        }
        onOpenMap={() => router.push('/(tabs)/explore')}
        onOpenPlaceDetail={
          journal.placeId.startsWith('osm-')
            ? () => router.push({ pathname: '/places/[placeId]', params: { placeId: journal.placeId } })
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
});
