import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  MapPin,
  Utensils,
  Star,
  Coffee,
} from 'lucide-react-native';
import { Journal } from '../../models/journal';
import {
  extractAvailableMonths,
  formatMonthLabel,
  calculateMonthlyDigest,
} from './culinaryAnalytics';
import { theme } from '../../config/theme';

interface CulinaryDigestScreenProps {
  journals: Journal[];
  loading: boolean;
  onBack: () => void;
  onPlaceSelect?: (placeId: string) => void;
}

export const CulinaryDigestScreen: React.FC<CulinaryDigestScreenProps> = ({
  journals,
  loading,
  onBack,
  onPlaceSelect,
}) => {
  const availableMonths = useMemo(() => extractAvailableMonths(journals), [journals]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || 'all'
  );

  const digest = useMemo(
    () => calculateMonthlyDigest(journals, selectedMonth),
    [journals, selectedMonth]
  );

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#3D2C1E" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Analitik & Pengeluaran</Text>
          <Text style={styles.headerSubtitle}>Riwayat kebiasaan & belanja kuliner</Text>
        </View>
      </View>

      {/* Month Filter Bar */}
      {availableMonths.length > 0 && (
        <View style={styles.monthBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScroll}
          >
            <TouchableOpacity
              style={[
                styles.monthChip,
                selectedMonth === 'all' && styles.monthChipActive,
              ]}
              onPress={() => setSelectedMonth('all')}
            >
              <Text
                style={[
                  styles.monthChipText,
                  selectedMonth === 'all' && styles.monthChipTextActive,
                ]}
              >
                Semua Waktu
              </Text>
            </TouchableOpacity>

            {availableMonths.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.monthChip,
                  selectedMonth === m && styles.monthChipActive,
                ]}
                onPress={() => setSelectedMonth(m)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === m && styles.monthChipTextActive,
                  ]}
                >
                  {formatMonthLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.terracotta} />
          <Text style={styles.loadingText}>Menghitung analitik kuliner...</Text>
        </View>
      ) : digest.totalVisits === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Wallet size={36} color={theme.colors.terracotta} />
          </View>
          <Text style={styles.emptyTitle}>Belum Ada Catatan Belanja</Text>
          <Text style={styles.emptySubtitle}>
            Catatan total belanja di dalam ulasan jurnalmu akan dirangkum otomatis di layar ini.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Main Spending Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroLabelRow}>
                <Wallet size={16} color="#D04A1E" />
                <Text style={styles.heroLabel}>Total Pengeluaran ({digest.monthLabel})</Text>
              </View>
              {digest.averageRating && (
                <View style={styles.heroRatingBadge}>
                  <Star size={11} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.heroRatingText}>{digest.averageRating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroAmount}>{formatRupiah(digest.totalSpent)}</Text>

            <View style={styles.heroMetricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{formatRupiah(digest.averageSpentPerVisit)}</Text>
                <Text style={styles.metricLabel}>Rata-rata / Kunjungan</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{digest.totalVisits}x</Text>
                <Text style={styles.metricLabel}>Kunjungan Kuliner</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{digest.uniquePlacesCount}</Text>
                <Text style={styles.metricLabel}>Tempat Berbeda</Text>
              </View>
            </View>
          </View>

          {/* 2. Category Spending Breakdown Bar */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color="#4E2E21" />
              <Text style={styles.sectionTitle}>Distribusi Pengeluaran Kategori</Text>
            </View>

            {/* Multi-segmented color bar */}
            {digest.totalSpent > 0 && (
              <View style={styles.progressBarContainer}>
                {digest.categories.map((c) =>
                  c.percentage > 0 ? (
                    <View
                      key={c.category}
                      style={[
                        styles.progressBarSegment,
                        {
                          flex: c.percentage,
                          backgroundColor: c.color,
                        },
                      ]}
                    />
                  ) : null
                )}
              </View>
            )}

            {/* Category breakdown items */}
            <View style={styles.categoryList}>
              {digest.categories.map((c) => (
                <View key={c.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfoLeft}>
                    <View style={[styles.colorDot, { backgroundColor: c.color }]} />
                    <View>
                      <Text style={styles.categoryNameText}>{c.label}</Text>
                      <Text style={styles.categoryCountText}>{c.count} kunjungan</Text>
                    </View>
                  </View>

                  <View style={styles.categoryInfoRight}>
                    <Text style={styles.categorySpentText}>{formatRupiah(c.spent)}</Text>
                    <Text style={styles.categoryPctText}>{c.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 3. Top Visited Places */}
          {digest.topPlaces.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color="#4E2E21" />
                <Text style={styles.sectionTitle}>Tempat Paling Sering Dikunjungi</Text>
              </View>

              {digest.topPlaces.map((p, idx) => (
                <TouchableOpacity
                  key={p.placeId}
                  style={styles.topPlaceRow}
                  activeOpacity={onPlaceSelect ? 0.7 : 1}
                  onPress={() => onPlaceSelect && onPlaceSelect(p.placeId)}
                >
                  <View style={styles.placeRankBadge}>
                    <Text style={styles.placeRankText}>{idx + 1}</Text>
                  </View>

                  <View style={styles.placeInfoCol}>
                    <Text style={styles.placeTitleText} numberOfLines={1}>
                      {p.placeName}
                    </Text>
                    <Text style={styles.placeMetaText}>
                      Total belanja: {formatRupiah(p.totalSpent)}
                    </Text>
                  </View>

                  <View style={styles.placeStatsCol}>
                    <View style={styles.placeVisitChip}>
                      <Text style={styles.placeVisitChipText}>{p.visitCount}x visit</Text>
                    </View>
                    <View style={styles.placeRatingRow}>
                      <Star size={10} color="#E67E22" fill="#E67E22" />
                      <Text style={styles.placeRatingText}>{p.averageRating.toFixed(1)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 4. Top Dishes / Menus */}
          {digest.topDishes.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Utensils size={16} color="#4E2E21" />
                <Text style={styles.sectionTitle}>Hidangan Favorit</Text>
              </View>

              {digest.topDishes.map((dish, idx) => (
                <View key={idx} style={styles.topDishRow}>
                  <View style={styles.dishIconCircle}>
                    <Coffee size={15} color="#D04A1E" />
                  </View>

                  <View style={styles.dishInfoCol}>
                    <Text style={styles.dishNameText} numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text style={styles.dishPlaceText} numberOfLines={1}>
                      di {dish.placeName}
                    </Text>
                  </View>

                  <View style={styles.dishPriceCol}>
                    <Text style={styles.dishPriceText}>{formatRupiah(dish.price)}</Text>
                    {dish.rating ? (
                      <View style={styles.dishRatingRow}>
                        <Star size={10} color="#E67E22" fill="#E67E22" />
                        <Text style={styles.dishRatingText}>{dish.rating}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2B2321',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 1,
  },
  monthBar: {
    backgroundColor: '#FAF5EE',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
  },
  monthScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  monthChipActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6461',
  },
  monthChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#8A7A6D',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FBEFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2321',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A6D',
    textAlign: 'center',
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    shadowColor: '#2B2321',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7A6D',
  },
  heroRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D04A1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroRatingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2B2321',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE4',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFE7DE',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2321',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#8A7A6D',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2321',
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#F3EDE4',
    marginBottom: 14,
  },
  progressBarSegment: {
    height: '100%',
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2B2321',
  },
  categoryCountText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  categoryInfoRight: {
    alignItems: 'flex-end',
  },
  categorySpentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2321',
  },
  categoryPctText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  topPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDE4',
  },
  placeRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBEFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D04A1E',
  },
  placeInfoCol: {
    flex: 1,
  },
  placeTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2321',
  },
  placeMetaText: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 2,
  },
  placeStatsCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  placeVisitChip: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  placeVisitChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4E2E21',
  },
  placeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  placeRatingText: {
    fontSize: 11,
    color: '#8A7A6D',
    fontWeight: '600',
  },
  topDishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDE4',
  },
  dishIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishInfoCol: {
    flex: 1,
  },
  dishNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2321',
  },
  dishPlaceText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  dishPriceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  dishPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D04A1E',
  },
  dishRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dishRatingText: {
    fontSize: 10,
    color: '#8A7A6D',
    fontWeight: '600',
  },
});
