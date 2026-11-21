import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import {
  buildTasteProfile,
  rankRecommendations,
  generateAITasteSummary,
  TasteProfile,
  RecommendationItem,
} from '../features/recommendations';
import { TasteProfileCard } from '../features/recommendations/components/TasteProfileCard';
import { RecommendationCard } from '../features/recommendations/components/RecommendationCard';
import {
  journalRepository,
  wishlistRepository,
  userPreferencesRepository,
} from '../repositories';
import { placesService } from '../services/places/placesService';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { feedback } from '../components/feedback';
import { theme } from '../config/theme';

interface AIRecommendationsScreenProps {
  userId: string;
  userLocation: UserLocation;
  onBack: () => void;
  onOpenExplore: () => void;
  onPlaceSelect: (place: NearbyPlace) => void;
}

export const AIRecommendationsScreen: React.FC<AIRecommendationsScreenProps> = ({
  userId,
  userLocation,
  onBack,
  onOpenExplore,
  onPlaceSelect,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [aiSummary, setAiSummary] = useState<string | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    const [journals, wishlistItems, settings] = await Promise.all([
      journalRepository.getJournals(userId),
      wishlistRepository.getWishlist(userId),
      userPreferencesRepository.getSettings(userId),
    ]);

    const wIds = new Set(wishlistItems.map((w) => w.placeId));
    const visitedIds = new Set(
      journals.map((j) => j.placeId).filter((id): id is string => Boolean(id))
    );

    const profile = buildTasteProfile(journals, settings.foodPreferences);
    const radiusMeters = (settings.searchRadiusKm || 5) * 1000;
    const nearby = await placesService.searchNearby(
      userLocation.latitude,
      userLocation.longitude,
      radiusMeters,
      'all'
    );

    const ranked = rankRecommendations({
      tasteProfile: profile,
      nearbyPlaces: nearby,
      visitedPlaceIds: visitedIds,
      wishlistPlaceIds: wIds,
    });

    let summary: string | undefined;
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (apiKey && profile.totalJournals > 0) {
      summary = await generateAITasteSummary(profile, apiKey).catch(() => undefined);
    }

    return { profile, ranked, wIds, summary };
  }, [userId, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    let active = true;
    fetchData()
      .then((res) => {
        if (!active) return;
        setTasteProfile(res.profile);
        setRecommendations(res.ranked);
        setWishlistIds(res.wIds);
        if (res.summary) setAiSummary(res.summary);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData()
      .then((res) => {
        setTasteProfile(res.profile);
        setRecommendations(res.ranked);
        setWishlistIds(res.wIds);
        if (res.summary) setAiSummary(res.summary);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleToggleWishlist = async (place: NearbyPlace) => {
    const isCurrentlyIn = wishlistIds.has(place.id);
    if (isCurrentlyIn) {
      try {
        await wishlistRepository.removeFromWishlist(userId, place.id);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(place.id);
          return next;
        });
        setRecommendations((prev) =>
          prev.map((r) => (r.place.id === place.id ? { ...r, isInWishlist: false } : r))
        );
        feedback.showToast(`"${place.name}" dihapus dari Wishlist.`, 'info');
      } catch (err) {
        feedback.showAlert('Gagal Menghapus', err instanceof Error ? err.message : String(err));
      }
    } else {
      try {
        await wishlistRepository.addToWishlist(userId, {
          placeId: place.id,
          placeName: place.name,
          placeAddress: place.address || '',
          mainCategory: place.mainCategory,
          subCategory: place.subCategory,
          subCategoryLabel: place.subCategoryLabel || place.subCategory || 'Kuliner',
          latitude: place.latitude,
          longitude: place.longitude,
        });
        setWishlistIds((prev) => new Set(prev).add(place.id));
        setRecommendations((prev) =>
          prev.map((r) => (r.place.id === place.id ? { ...r, isInWishlist: true } : r))
        );
        feedback.showToast(`"${place.name}" ditambahkan ke Wishlist!`, 'success');
      } catch (err) {
        feedback.showAlert('Gagal Menyimpan', err instanceof Error ? err.message : String(err));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Kembali">
          <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Sparkles size={18} color="#D04A1E" />
          <Text style={styles.title}>Rekomendasi Kuliner AI</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenExplore}
          style={styles.exploreBtn}
          accessibilityLabel="Buka Explore"
        >
          <Compass size={20} color={theme.colors.coffeeBrown} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <LoadingState message="Menganalisis profil rasa & mencari rekomendasi..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRefresh} />
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.place.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={
            tasteProfile ? (
              <TasteProfileCard profile={tasteProfile} aiSummary={aiSummary} />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Sparkles size={34} color={theme.colors.terracotta} />
              <Text style={styles.emptyTitle}>Belum Ada Rekomendasi Terdekat</Text>
              <Text style={styles.emptySubtitle}>
                Tidak ada tempat kuliner OpenStreetMap yang terdeteksi di sekitar radius lokasimu saat ini.
              </Text>
              <TouchableOpacity onPress={onOpenExplore} style={styles.exploreCta}>
                <Text style={styles.exploreCtaText}>Jelajahi di Explore</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <RecommendationCard
              item={item}
              onPressPlace={onPlaceSelect}
              onToggleWishlist={handleToggleWishlist}
            />
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBE3',
  },
  backBtn: {
    padding: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  exploreBtn: {
    padding: 6,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A6D',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreCta: {
    marginTop: 16,
    backgroundColor: '#4E2E21',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
