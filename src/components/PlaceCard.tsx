import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NearbyPlace } from '../types/places';
import { theme } from '../config/theme';
import { MapPin, Heart, Star } from 'lucide-react-native';
import { formatDistance } from '../utils/geo';

interface PlaceCardProps {
  place: NearbyPlace;
  onPress?: () => void;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onPress,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  const formattedDistance = place.distanceMeter !== undefined ? formatDistance(place.distanceMeter) : null;
  const details = [place.cuisine?.replace(/_/g, ' ').replace(/;/g, ', '), place.openingHours].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Kolom Kiri: Foto Tempat dengan Badge Jarak & Tombol Wishlist */}
      <View style={styles.imageCol}>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbPlaceholder]}>
            <MapPin size={26} color={theme.colors.terracotta} />
          </View>
        )}
        
        {/* Wishlist Heart Icon */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={onWishlistToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={16}
            color={isWishlisted ? theme.colors.terracotta : '#FFFFFF'}
            fill={isWishlisted ? theme.colors.terracotta : 'transparent'}
          />
        </TouchableOpacity>

        {/* Distance Badge */}
        {formattedDistance && (
          <View style={styles.distanceBadge}>
            <MapPin size={10} color="#FFFFFF" />
            <Text style={styles.distanceText}>{formattedDistance}</Text>
          </View>
        )}
      </View>

      {/* Kolom Kanan: Detail Tempat */}
      <View style={styles.contentCol}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>

        </View>

        {/* Location & Category Pill */}
        <View style={styles.subRow}>
          <View style={styles.locationContainer}>
            <MapPin size={11} color={theme.colors.terracotta} />
            <Text style={styles.addressText} numberOfLines={1}>
              {place.address || 'Kawasan Sekitar'}
            </Text>
          </View>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {place.subCategoryLabel || (place.mainCategory === 'drinks' ? 'Kopi/Cafe' : place.mainCategory === 'wisata' ? 'Wisata' : 'Restoran')}
            </Text>
          </View>
        </View>

        {/* OSM provides no ratings; show a rating only if a real source supplied one. */}
        <View style={styles.ratingRow}>
          {place.ratingAverage !== undefined ? (
            <>
              <Star size={12} color={theme.colors.caramel} fill={theme.colors.caramel} style={{ marginRight: 3 }} />
              <Text style={styles.ratingScore}>{place.ratingAverage.toFixed(1)}</Text>
              {place.ratingCount !== undefined && <Text style={styles.reviewCount}>({place.ratingCount})</Text>}
            </>
          ) : (
            <Text style={styles.reviewCount}>Belum ada rating</Text>
          )}
        </View>

        {details ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {details}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  thumbPlaceholder: {
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0E8DC',
    ...theme.shadows.card,
  },
  imageCol: {
    width: 125,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5EFEB',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: theme.fonts.serifBold,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginRight: 4,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  addressText: {
    fontSize: 11,
    color: theme.colors.espresso,
    marginLeft: 3,
  },
  categoryPill: {
    backgroundColor: theme.colors.cream,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginRight: 3,
  },
  reviewCount: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  descriptionText: {
    fontSize: 11,
    lineHeight: 15,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
