import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { DiaryEntry } from '../types/diary';
import { UserProfile } from '../services/firebase/authService';
import { theme } from '../config/theme';
import { useProfileScreen } from '../features/profile/hooks/useProfileScreen';
import { ProfileHeroHeader } from '../features/profile/components/ProfileHeroHeader';
import { ProfileStatsBar } from '../features/profile/components/ProfileStatsBar';
import { ProfileTabs } from '../features/profile/components/ProfileTabs';
import { ProfileJournalItem } from '../features/profile/components/ProfileJournalItem';
import { ProfilePlaceItem } from '../features/profile/components/ProfilePlaceItem';
import { ProfileDishItem } from '../features/profile/components/ProfileDishItem';
import { ProfileWishlistItem } from '../features/profile/components/ProfileWishlistItem';
import { EmptyState } from '../components/feedback/EmptyState';
import { BookOpen, MapPin, Utensils, Heart } from 'lucide-react-native';

export interface ProfileScreenProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onJournalSelect?: (journal: DiaryEntry) => void;
  onEditProfile?: () => void;
  onOpenAIRecommendations?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenSettings,
  onJournalSelect,
  onEditProfile,
}) => {
  const {
    activeTab,
    setActiveTab,
    userDiaries,
    visitedPlaces,
    dishes,
    wishlistItems,
    stats,
    loading,
    error,
    reload,
  } = useProfileScreen(user);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      {/* 1. Header with Bio, Avatar & Settings CTA */}
      <ProfileHeroHeader
        user={user}
        onOpenSettings={onOpenSettings}
        onEditProfile={onEditProfile}
      />

      {/* 2. Culinary Statistics Bar */}
      <ProfileStatsBar stats={stats} />

      {/* 3. Segmented Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        journalsCount={userDiaries.length}
        placesCount={visitedPlaces.length}
        menuCount={dishes.length}
        wishlistCount={wishlistItems.length}
      />

      {/* 4. Tab Content: Journals / Places / Menus / Wishlist */}
      <View style={styles.tabContentContainer}>
        {loading && userDiaries.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.terracotta} />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Data gagal dimuat: {error}</Text>
          </View>
        ) : activeTab === 'jurnal' ? (
          userDiaries.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={32} color={theme.colors.terracotta} />}
              title="Belum Ada Jurnal"
              subtitle="Mulai catat pengalaman kuliner pertamamu hari ini."
            />
          ) : (
            userDiaries.map((journal) => (
              <ProfileJournalItem
                key={journal.id}
                journal={journal}
                onPress={() => onJournalSelect && onJournalSelect(journal)}
              />
            ))
          )
        ) : activeTab === 'tempat' ? (
          visitedPlaces.length === 0 ? (
            <EmptyState
              icon={<MapPin size={32} color={theme.colors.terracotta} />}
              title="Belum Ada Tempat Dikunjungi"
              subtitle="Tempat kuliner yang kamu beri ulasan akan otomatis terkumpul di sini."
            />
          ) : (
            visitedPlaces.map((place) => {
              const matchedJournal = userDiaries.find((d) => d.placeId === place.placeId);
              return (
                <ProfilePlaceItem
                  key={place.placeId}
                  place={place}
                  onPress={
                    matchedJournal && onJournalSelect
                      ? () => onJournalSelect(matchedJournal)
                      : undefined
                  }
                />
              );
            })
          )
        ) : activeTab === 'menu' ? (
          dishes.length === 0 ? (
            <EmptyState
              icon={<Utensils size={32} color={theme.colors.terracotta} />}
              title="Belum Ada Menu Dicatat"
              subtitle="Hidangan yang kamu ulas di dalam jurnal akan dirangkum di sini."
            />
          ) : (
            dishes.map((dish) => {
              const matchedJournal = userDiaries.find((d) => d.id === dish.journalId);
              return (
                <ProfileDishItem
                  key={dish.id}
                  dish={dish}
                  onPress={
                    matchedJournal && onJournalSelect
                      ? () => onJournalSelect(matchedJournal)
                      : undefined
                  }
                />
              );
            })
          )
        ) : activeTab === 'wishlist' ? (
          wishlistItems.length === 0 ? (
            <EmptyState
              icon={<Heart size={32} color={theme.colors.terracotta} />}
              title="Wishlist Masih Kosong"
              subtitle="Simpan tempat dari Explore yang ingin kamu kunjungi nanti."
            />
          ) : (
            wishlistItems.map((item) => (
              <ProfileWishlistItem key={item.id} item={item} />
            ))
          )
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  tabContentContainer: {
    paddingHorizontal: 20,
    marginTop: 6,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#8A7A6D',
    textAlign: 'center',
  },
});
