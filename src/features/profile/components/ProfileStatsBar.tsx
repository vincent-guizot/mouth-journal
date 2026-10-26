import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CulinaryStats } from '../../../types/diary';
import { theme } from '../../../config/theme';

interface ProfileStatsBarProps {
  stats: CulinaryStats;
}

export const ProfileStatsBar: React.FC<ProfileStatsBarProps> = ({ stats }) => {
  return (
    <View style={styles.statsCardContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.totalVisits || 18}</Text>
          <Text style={styles.statLabel}>Jurnal</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.totalPlaces || 14}</Text>
          <Text style={styles.statLabel}>Tempat</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum} numberOfLines={1}>
            {stats.favoriteCategory || 'Kopi/Cafe'}
          </Text>
          <Text style={styles.statLabel}>Favorit</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNum}>
            {stats.averageRating ? stats.averageRating.toFixed(1) : '4.7'}
          </Text>
          <Text style={styles.statLabel}>Rata-rata</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCardContainer: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
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
