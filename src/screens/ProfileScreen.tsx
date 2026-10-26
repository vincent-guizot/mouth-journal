import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { DiaryEntry } from '../types/diary';
import { UserProfile } from '../services/firebase/authService';
import { theme } from '../config/theme';
import { useProfileScreen } from '../features/profile/hooks/useProfileScreen';
import { ProfileHeroHeader } from '../features/profile/components/ProfileHeroHeader';
import { ProfileStatsBar } from '../features/profile/components/ProfileStatsBar';
import { ProfileBadgesSection } from '../features/profile/components/ProfileBadgesSection';
import { ProfileTabs } from '../features/profile/components/ProfileTabs';
import { ProfileJournalItem } from '../features/profile/components/ProfileJournalItem';

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
  onLogout,
  onOpenSettings,
  onJournalSelect,
  onEditProfile,
  onOpenAIRecommendations,
}) => {
  const {
    activeTab,
    setActiveTab,
    userDiaries,
    stats,
    loading,
  } = useProfileScreen(user);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header with Bio, Avatar & Settings CTA */}
      <ProfileHeroHeader
        user={user}
        onOpenSettings={onOpenSettings}
        onEditProfile={onEditProfile}
      />

      {/* 2. Culinary Statistics Bar */}
      <ProfileStatsBar stats={stats} />

      {/* 3. Achievements & Badges */}
      <ProfileBadgesSection />

      {/* 4. Segmented Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        journalsCount={userDiaries.length}
        placesCount={stats.totalPlaces || 14}
      />

      {/* 5. Tab Content: Journals / Places / Menus / Wishlist */}
      <View style={styles.tabContentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.terracotta} />
          </View>
        ) : activeTab === 'jurnal' ? (
          userDiaries.map((journal) => (
            <ProfileJournalItem
              key={journal.id}
              journal={journal}
              onPress={() => onJournalSelect && onJournalSelect(journal)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Fitur {activeTab} siap ditampilkan dalam rilis berikutnya.
            </Text>
          </View>
        )}
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
