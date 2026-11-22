import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CulinaryStats } from '../../../types/diary';
import { TrendingUp, ChevronRight } from 'lucide-react-native';

interface ProfileStatsBarProps {
  stats: CulinaryStats;
  onPress?: () => void;
}

export const ProfileStatsBar: React.FC<ProfileStatsBarProps> = ({ stats, onPress }) => {
  const content = (
    <View style={styles.cardWrapper}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.totalVisits}</Text>
          <Text style={styles.statLabel}>Jurnal</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.totalPlaces}</Text>
          <Text style={styles.statLabel}>Tempat</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum} numberOfLines={1}>
            {stats.favoriteCategory ?? '–'}
          </Text>
          <Text style={styles.statLabel}>Favorit</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum}>
            {stats.averageRating !== null ? stats.averageRating.toFixed(1) : '–'}
          </Text>
          <Text style={styles.statLabel}>Rata-rata</Text>
        </View>
      </View>

      {onPress && (
        <View style={styles.statsFooterRow}>
          <TrendingUp size={12} color="#D04A1E" />
          <Text style={styles.statsFooterText}>Lihat Analitik Pengeluaran & Rasa</Text>
          <ChevronRight size={12} color="#D04A1E" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.statsCardContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.statsCardContainer}>{content}</View>;
};

const styles = StyleSheet.create({
  statsCardContainer: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  cardWrapper: {
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statsFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    backgroundColor: '#F3EDE4',
    borderTopWidth: 1,
    borderTopColor: '#EFE3D3',
  },
  statsFooterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D04A1E',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3D2C1E',
  },
  statLabel: {
    fontSize: 10,
    color: '#8A7A6D',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFE3D3',
  },
});
