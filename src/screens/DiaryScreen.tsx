import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { DiaryEntry } from '../types/diary';
import { DiaryCard } from '../components/DiaryCard';
import { theme } from '../config/theme';
import { Search } from 'lucide-react-native';
import { useDiaryScreen } from '../features/diary/hooks/useDiaryScreen';
import { DiarySegmentTab } from '../features/diary/components/DiarySegmentTab';
import { DiaryCategoryPills } from '../features/diary/components/DiaryCategoryPills';
import { DiaryEmptyView } from '../features/diary/components/DiaryEmptyView';
import { ErrorState } from '../components/feedback/ErrorState';

export interface DiaryScreenProps {
  userId: string;
  onJournalSelect: (entry: DiaryEntry) => void;
}

export const DiaryScreen: React.FC<DiaryScreenProps> = ({ userId, onJournalSelect }) => {
  const {
    activeSegment,
    setActiveSegment,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredDiaries,
    loading,
    refreshing,
    onRefresh,
    error,
    syncState,
  } = useDiaryScreen({ userId });

  return (
    <View style={styles.container}>
      {/* 1. Segmented Control (Timeline vs Favorit) */}
      <DiarySegmentTab
        activeSegment={activeSegment}
        onSegmentChange={setActiveSegment}
      />

      {/* 2. Category Filter Chips (Horizontal) - Di atas Search */}
      <DiaryCategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Search Bar - Di bawah Kategori */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={theme.colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tempat, menu, atau catatan..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {(syncState.pending > 0 || syncState.failed.length > 0) && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>
            {syncState.failed.length > 0
              ? `${syncState.failed.length} perubahan ditolak server: ${syncState.failed[0].lastError ?? 'tidak diketahui'}`
              : `${syncState.pending} perubahan menunggu sinkronisasi ke cloud.`}
          </Text>
        </View>
      )}

      {/* 5. Diary Cards Feed */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.terracotta} />
          <Text style={styles.loadingText}>Memuat catatan kuliner...</Text>
        </View>
      ) : error && filteredDiaries.length === 0 ? (
        <ErrorState message={error} onRetry={onRefresh} />
      ) : filteredDiaries.length === 0 ? (
        <DiaryEmptyView segment={activeSegment} />
      ) : (
        <FlatList
          data={filteredDiaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              entry={item}
              onPress={() => onJournalSelect(item)}
            />
          )}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.terracotta]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  syncBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#F0C38E',
  },
  syncBannerText: {
    fontSize: 12,
    color: '#7A4B12',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: 4,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    marginRight: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.coffeeBrown,
  },
  feedContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 8,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
