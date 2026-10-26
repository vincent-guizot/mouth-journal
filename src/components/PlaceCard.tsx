import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NearbyPlace } from '../types/places';
import { theme } from '../config/theme';
import { MapPin, MoreVertical, Heart, Star } from 'lucide-react-native';

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
  const formattedDistance =
    place.distanceMeter && place.distanceMeter >= 1000
      ? `${(place.distanceMeter / 1000).toFixed(1)} km`
      : `${place.distanceMeter || 800} m`;

  const fallbackImage =
    place.photoUrl ||
    (place.mainCategory === 'drinks'
      ? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
      : place.mainCategory === 'wisata'
      ? 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');

  const reviewSnippet =
    place.cuisine ||
    (place.mainCategory === 'drinks'
      ? 'Tempatnya nyaman, kopi enak, croissantnya juga flaky banget. Cocok buat kerja sambil ngopi.'
      : place.mainCategory === 'wisata'
      ? 'Taman yang asri, udara segar dan spot foto estetik di tengah kota.'
      : 'Menu andalan lezat, suasana nyaman dan pelayanan sangat ramah.');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Kolom Kiri: Foto Tempat dengan Badge Jarak & Tombol Wishlist */}
      <View style={styles.imageCol}>
        <Image source={{ uri: fallbackImage }} style={styles.thumbnail} resizeMode="cover" />
        
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
        <View style={styles.distanceBadge}>
          <MapPin size={10} color="#FFFFFF" />
          <Text style={styles.distanceText}>{formattedDistance}</Text>
        </View>
      </View>

      {/* Kolom Kanan: Detail Tempat */}
      <View style={styles.contentCol}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>
          <TouchableOpacity hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <MoreVertical size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
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

        {/* Rating Stars & Count */}
        <View style={styles.ratingRow}>
          <View style={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                color={theme.colors.caramel}
                fill={theme.colors.caramel}
                style={{ marginRight: 1 }}
              />
            ))}
          </View>
          <Text style={styles.ratingScore}>{place.ratingAverage || 4.5}</Text>
          <Text style={styles.reviewCount}>({place.userVisitedCount ? `${place.userVisitedCount}K` : '850'})</Text>
        </View>

        {/* Review Snippet */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          {reviewSnippet}
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
