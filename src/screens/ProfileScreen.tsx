import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { DiaryEntry } from '../types/diary';
import { UserProfile } from '../models/user';
import { theme } from '../config/theme';
import { useProfileScreen } from '../features/profile/hooks/useProfileScreen';
import { ProfileHeroHeader } from '../features/profile/components/ProfileHeroHeader';
import { ProfileStatsBar } from '../features/profile/components/ProfileStatsBar';
import { ProfileTabs } from '../features/profile/components/ProfileTabs';
import { ProfileJournalItem } from '../features/profile/components/ProfileJournalItem';
import { ProfilePlaceItem } from '../features/profile/components/ProfilePlaceItem';
import { ProfileDishItem } from '../features/profile/components/ProfileDishItem';
import { ProfileWishlistItem } from '../features/profile/components/ProfileWishlistItem';
import { WishlistMenuCard } from '../features/wishlist/components/WishlistMenuCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { DecorativeAssets } from '../config/assets';
import { BookOpen, MapPin, Utensils, Heart, Sparkles, ChevronRight, Compass } from 'lucide-react-native';

export interface ProfileScreenProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onJournalSelect?: (journal: DiaryEntry) => void;
  onEditProfile?: () => void;
  onOpenAIRecommendations?: () => void;
  onOpenMemoryMap?: () => void;
  onOpenAnalytics?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenSettings,
  onJournalSelect,
  onEditProfile,
  onOpenAIRecommendations,
  onOpenMemoryMap,
  onOpenAnalytics,
}) => {
  const {
    activeTab,
    setActiveTab,
    userDiaries,
    visitedPlaces,
    dishes,
    wishlistItems,
    menuWishlistItems,
    stats,
    loading,
    error,
    reload,
  } = useProfileScreen(user);

  const totalWishlistCount = wishlistItems.length + menuWishlistItems.length;

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

      {/* 2. AI Recommendations Banner */}
      {onOpenAIRecommendations && (
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={onOpenAIRecommendations}
          activeOpacity={0.88}
        >
          <View style={styles.aiBannerIcon}>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
          <View style={styles.aiBannerTextCol}>
            <Text style={styles.aiBannerTitle}>Rekomendasi Kuliner AI</Text>
            <Text style={styles.aiBannerSubtitle}>Lihat profil selera rasa & tempat cocok di sekitarmu</Text>
          </View>
          <ChevronRight size={18} color="#D04A1E" />
        </TouchableOpacity>
      )}

      {/* 3. Culinary Statistics Bar */}
      <ProfileStatsBar stats={stats} onPress={onOpenAnalytics} />

      {/* 4. Segmented Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        journalsCount={userDiaries.length}
        placesCount={visitedPlaces.length}
        menuCount={dishes.length}
        wishlistCount={totalWishlistCount}
      />

      {/* 5. Tab Content: Journals / Places / Menus / Wishlist */}
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
              illustration={DecorativeAssets.iconForkSpoon}
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
              illustration={DecorativeAssets.iconCoffeeCup}
              icon={<MapPin size={32} color={theme.colors.terracotta} />}
              title="Belum Ada Tempat Dikunjungi"
              subtitle="Tempat kuliner yang kamu beri ulasan akan otomatis terkumpul di sini."
            />
          ) : (
            <>
              {onOpenMemoryMap && (
                <TouchableOpacity
                  style={styles.mapBannerBtn}
                  onPress={onOpenMemoryMap}
                  activeOpacity={0.8}
                >
                  <View style={styles.mapBannerIcon}>
                    <Compass size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.mapBannerTextCol}>
                    <Text style={styles.mapBannerTitle}>Buka Peta Jejak Kuliner</Text>
                    <Text style={styles.mapBannerSubtitle}>
                      Lihat sebaran {visitedPlaces.length} tempat di peta interaktif
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#D04A1E" />
                </TouchableOpacity>
              )}
              {visitedPlaces.map((place) => {
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
              })}
            </>
          )
        ) : activeTab === 'menu' ? (
          dishes.length === 0 ? (
            <EmptyState
              illustration={DecorativeAssets.iconCroissant}
              icon={<Utensils size={32} color={theme.colors.terracotta} />}
              title="Belum Ada Menu Dicatat"
              subtitle="Menu pesanan yang kamu masukkan di jurnal akan muncul di sini."
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
          totalWishlistCount === 0 ? (
            <EmptyState
              illustration={DecorativeAssets.flourishHeartRadiant}
              icon={<Heart size={32} color={theme.colors.terracotta} />}
              title="Wishlist Masih Kosong"
              subtitle="Simpan tempat dari Explore atau menu yang ingin kamu cicipi nanti."
            />
          ) : (
            <>
              {wishlistItems.map((item) => (
                <ProfileWishlistItem key={item.id} item={item} />
              ))}
              {menuWishlistItems.map((menuItem) => (
                <WishlistMenuCard key={menuItem.id} item={menuItem} />
              ))}
            </>
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
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    gap: 10,
  },
  aiBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#D04A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTextCol: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  aiBannerSubtitle: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 1,
  },
  mapBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    gap: 10,
  },
  mapBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#D04A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBannerTextCol: {
    flex: 1,
  },
  mapBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  mapBannerSubtitle: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 1,
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
