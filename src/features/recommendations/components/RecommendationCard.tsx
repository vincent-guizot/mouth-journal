import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Heart, Sparkles, Check, ArrowRight } from 'lucide-react-native';
import { RecommendationItem } from '../recommendationEngine';
import { formatDistance } from '../../../utils/geo';
import { NearbyPlace } from '../../../types/places';

interface RecommendationCardProps {
  item: RecommendationItem;
  onPressPlace: (place: NearbyPlace) => void;
  onToggleWishlist: (place: NearbyPlace) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onPressPlace,
  onToggleWishlist,
}) => {
  const { place, matchScore, primaryReason, isAlreadyVisited, isInWishlist } = item;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPressPlace(place)}
      activeOpacity={0.88}
    >
      <View style={styles.headerRow}>
        <View style={styles.scorePill}>
          <Sparkles size={11} color="#FFFFFF" />
          <Text style={styles.scoreText}>{matchScore}% Cocok</Text>
        </View>

        <View style={styles.badgesGroup}>
          {isAlreadyVisited && (
            <View style={styles.visitedBadge}>
              <Check size={11} color="#2E6B38" />
              <Text style={styles.visitedBadgeText}>Pernah Dikunjungi</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.heartBtn, isInWishlist && styles.heartBtnActive]}
            onPress={() => onToggleWishlist(place)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isInWishlist ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
          >
            <Heart
              size={15}
              color={isInWishlist ? '#D04A1E' : '#8A7A6D'}
              fill={isInWishlist ? '#D04A1E' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainInfo}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.categoryLabel}>
            {place.subCategoryLabel || place.subCategory || 'Kuliner'}
          </Text>
          {place.distanceMeter !== undefined && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <View style={styles.distanceRow}>
                <MapPin size={11} color="#8A7A6D" />
                <Text style={styles.distanceText}>{formatDistance(place.distanceMeter)}</Text>
              </View>
            </>
          )}
        </View>

        {place.address ? (
          <Text style={styles.addressText} numberOfLines={1}>
            {place.address}
          </Text>
        ) : null}
      </View>

      <View style={styles.reasonBanner}>
        <Sparkles size={12} color="#D04A1E" />
        <Text style={styles.reasonText} numberOfLines={2}>
          {primaryReason}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.actionPrompt}>Lihat Info & Menu</Text>
        <ArrowRight size={13} color="#D04A1E" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D04A1E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F4EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visitedBadgeText: {
    color: '#2E6B38',
    fontSize: 10,
    fontWeight: '700',
  },
  heartBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#FAF5EE',
  },
  heartBtnActive: {
    backgroundColor: '#FDEEE9',
  },
  mainInfo: {
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E5240',
  },
  metaDot: {
    fontSize: 12,
    color: '#8A7A6D',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  addressText: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 2,
  },
  reasonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FAF5EE',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E6D8',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 11,
    color: '#5C4434',
    lineHeight: 15,
    flex: 1,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 4,
  },
  actionPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D04A1E',
  },
});
