import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MapPin, Heart } from 'lucide-react-native';
import { WishlistItem } from '../../../models/wishlist';
import { formatDistance } from '../../../utils/geo';

interface WishlistPlaceCardProps {
  item: WishlistItem;
  /** Distance from the user's current location, if known. */
  distanceMeter?: number;
  onPress: () => void;
  onToggleHeart: () => void;
}

export const WishlistPlaceCard: React.FC<WishlistPlaceCardProps> = ({
  item,
  distanceMeter,
  onPress,
  onToggleHeart,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageCol}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: '#FAF5EE', alignItems: 'center', justifyContent: 'center' }]}>
            <MapPin size={22} color="#D04A1E" />
          </View>
        )}
      </View>

      <View style={styles.contentCol}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.placeName}
          </Text>
          <View style={styles.actionIconGroup}>
            <TouchableOpacity
              accessibilityLabel="Hapus dari wishlist"
              onPress={onToggleHeart}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart size={16} color="#D04A1E" fill="#D04A1E" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={11} color="#D04A1E" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.placeAddress || 'Alamat tidak tersedia'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryLabel}>{item.subCategoryLabel}</Text>
          </View>
          {distanceMeter !== undefined && (
            <>
              <Text style={styles.distanceDot}>·</Text>
              <Text style={styles.distanceText}>{formatDistance(distanceMeter)}</Text>
            </>
          )}
        </View>

        {item.personalNotes ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.personalNotes}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageCol: {
    marginRight: 12,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
    marginRight: 6,
  },
  actionIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#8A7A6D',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  categoryIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B5749',
  },
  starsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
    marginRight: 2,
  },
  reviewCountText: {
    fontSize: 10,
    color: '#8A7A6D',
  },
  distanceDot: {
    marginHorizontal: 4,
    color: '#8A7A6D',
    fontSize: 10,
  },
  distanceText: {
    fontSize: 11,
    color: '#8A7A6D',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 11,
    color: '#6B5749',
    marginTop: 4,
    lineHeight: 15,
  },
});
