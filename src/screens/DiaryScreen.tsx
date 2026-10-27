import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { DiaryEntry } from '../types/diary';
import { NearbyPlace, UserLocation } from '../types/places';
import { DiaryCard } from '../components/DiaryCard';
import { theme } from '../config/theme';
import { Search } from 'lucide-react-native';
import { useDiaryScreen } from '../features/diary/hooks/useDiaryScreen';
import { DiarySegmentTab } from '../features/diary/components/DiarySegmentTab';
import { DiaryCategoryPills } from '../features/diary/components/DiaryCategoryPills';
import { DiaryEmptyView } from '../features/diary/components/DiaryEmptyView';

export interface DiaryScreenProps {
  userId: string;
  userLocation: UserLocation;
  onAddPress?: () => void;
  onAddLog?: () => void;
  onPlaceSelect: (place: NearbyPlace) => void;
  onJournalSelect?: (entry: DiaryEntry) => void;
  onOpenAIRecommendations?: () => void;
  onOpenMap?: () => void;
}

export const DiaryScreen: React.FC<DiaryScreenProps> = ({
  userId,
  userLocation,
  onAddPress,
  onAddLog,
  onPlaceSelect,
  onJournalSelect,
  onOpenAIRecommendations,
  onOpenMap,
}) => {
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
  } = useDiaryScreen({ userId });

  const handleCardPress = (entry: DiaryEntry) => {
    if (onJournalSelect) {
      onJournalSelect(entry);
      return;
    }

    const place: NearbyPlace = {
      id: entry.placeId,
      name: entry.placeName,
      mainCategory: entry.mainCategory,
      mainCategoryLabel: entry.mainCategory === 'drinks' ? 'Drinks' : entry.mainCategory === 'wisata' ? 'Wisata' : 'Food',
      subCategory: entry.subCategory,
      subCategoryLabel: entry.subCategoryLabel,
      latitude: entry.latitude,
      longitude: entry.longitude,
      address: entry.placeAddress,
      distanceMeter: 0,
      photoUrl: entry.photoUrls && entry.photoUrls.length > 0 ? entry.photoUrls[0] : undefined,
      ratingAverage: entry.overallRating,
      ratingCount: 1,
    };
    onPlaceSelect(place);
  };

  return (
    <View style={styles.container}>
      {/* 1. Segmented Control (Timeline vs Favorit) */}
      <DiarySegmentTab
        activeSegment={activeSegment}
        onSegmentChange={setActiveSegment}
      />

      {/* 2. Search Bar + Sliders Filter Button */}
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

      {/* 3. Category Filter Chips (Horizontal) */}
      <DiaryCategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 5. Diary Cards Feed */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.terracotta} />
          <Text style={styles.loadingText}>Memuat catatan kuliner...</Text>
        </View>
      ) : filteredDiaries.length === 0 ? (
        <DiaryEmptyView segment={activeSegment} />
      ) : (
        <FlatList
          data={filteredDiaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              entry={item}
              onPress={() => handleCardPress(item)}
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
