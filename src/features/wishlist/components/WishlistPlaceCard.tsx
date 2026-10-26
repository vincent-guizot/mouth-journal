import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MapPin, Heart, MoreVertical, Star } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { WishlistCardItem } from '../../../mocks/data/mockWishlist';

interface WishlistPlaceCardProps {
  item: WishlistCardItem;
  onPress: () => void;
  onToggleHeart: () => void;
}

export const WishlistPlaceCard: React.FC<WishlistPlaceCardProps> = ({
  item,
  onPress,
  onToggleHeart,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Thumbnail Kiri */}
      <View style={styles.imageCol}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="cover" />
      </View>

      {/* Konten Kanan */}
      <View style={styles.contentCol}>
        {/* Baris Atas: Judul & Ikon Hati + More */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.actionIconGroup}>
            <TouchableOpacity
              onPress={onToggleHeart}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginRight: 8 }}
            >
              <Heart size={16} color="#D04A1E" fill="#D04A1E" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <MoreVertical size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lokasi */}
        <View style={styles.locationRow}>
          <MapPin size={11} color="#D04A1E" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {/* Kategori, Rating Bintang, dan Jarak */}
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryIcon}>{item.categoryIcon}</Text>
            <Text style={styles.categoryLabel}>{item.categoryLabel}</Text>
          </View>

          <View style={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                color="#F39A28"
                fill="#F39A28"
                style={{ marginRight: 1 }}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
          <Text style={styles.distanceDot}>·</Text>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        {/* Catatan / Deskripsi Singkat */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
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
