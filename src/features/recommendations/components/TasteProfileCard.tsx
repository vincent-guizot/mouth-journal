import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Sparkles, Compass, Wallet, Award } from 'lucide-react-native';
import { TasteProfile } from '../recommendationEngine';
import { DecorativeAssets } from '../../../config/assets';

interface TasteProfileCardProps {
  profile: TasteProfile;
  aiSummary?: string;
}

export const TasteProfileCard: React.FC<TasteProfileCardProps> = ({ profile, aiSummary }) => {
  const hasJournals = profile.totalJournals > 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <Sparkles size={20} color="#D04A1E" />
        </View>
        <View style={styles.personaWrapper}>
          <Text style={styles.personaLabel}>Profil Rasa Kuliner</Text>
          <Text style={styles.personaTitle}>{profile.personaTitle}</Text>
        </View>
        <Image
          source={DecorativeAssets.flourishSwirlStar}
          style={styles.decorativeSticker}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.summaryText}>{aiSummary || profile.personaDescription}</Text>

      {hasJournals && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Award size={13} color="#8A7A6D" />
              <Text style={styles.statLabel}>Kategori Utama</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {profile.topCategories[0]?.category || '-'}
            </Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Wallet size={13} color="#8A7A6D" />
              <Text style={styles.statLabel}>Rata-rata Biaya</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {profile.budgetLabel}
            </Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Compass size={13} color="#8A7A6D" />
              <Text style={styles.statLabel}>Total Kunjungan</Text>
            </View>
            <Text style={styles.statValue}>{profile.totalJournals} Tempat</Text>
          </View>
        </View>
      )}

      {profile.topCategories.length > 1 && (
        <View style={styles.categoriesPillRow}>
          <Text style={styles.pillRowLabel}>Frekuensi:</Text>
          {profile.topCategories.slice(0, 3).map((cat) => (
            <View key={cat.category} style={styles.catPill}>
              <Text style={styles.catPillText}>
                {cat.category} ({cat.count}x · {cat.avgRating}⭐)
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DCD0',
  },
  personaWrapper: {
    flex: 1,
  },
  personaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7A6D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3D2C1E',
    marginTop: 1,
  },
  decorativeSticker: {
    width: 28,
    height: 28,
    opacity: 0.8,
  },
  summaryText: {
    fontSize: 13,
    color: '#5C4434',
    lineHeight: 19,
    marginTop: 12,
    fontStyle: 'normal',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE3D3',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#8A7A6D',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D2C1E',
    marginTop: 3,
  },
  categoriesPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  pillRowLabel: {
    fontSize: 11,
    color: '#8A7A6D',
    fontWeight: '600',
  },
  catPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6E5240',
  },
});
