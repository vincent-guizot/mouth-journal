import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, MapPin, ChevronRight, Bookmark } from 'lucide-react-native';
import { NearbyPlace } from '../../../types/places';
import { theme } from '../../../config/theme';

interface ExplorePinPopupProps {
  place: NearbyPlace;
  onPress: () => void;
  onClose?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export const ExplorePinPopup: React.FC<ExplorePinPopupProps> = ({
  place,
  onPress,
  onClose,
  onToggleWishlist,
  isWishlisted,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {place.photoUrl ? (
        <Image source={{ uri: place.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: '#FAF5EE' }]} />
      )}
      <View style={styles.infoCol}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          {onToggleWishlist && (
            <TouchableOpacity onPress={onToggleWishlist} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Bookmark
                size={16}
                color={isWishlisted ? '#D04A1E' : '#8A7A6D'}
                fill={isWishlisted ? '#D04A1E' : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.locationRow}>
          <MapPin size={11} color="#D04A1E" />
          <Text style={styles.address} numberOfLines={1}>
            {place.address || 'Alamat tidak tersedia'}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          {place.ratingAverage !== undefined && (
            <>
              <Star size={12} color="#F39A28" fill="#F39A28" />
              <Text style={styles.ratingText}>{place.ratingAverage.toFixed(1)}</Text>
            </>
          )}
          {place.distanceMeter !== undefined && (
            <Text style={styles.ratingCount}>
              {place.distanceMeter >= 1000
                ? `${(place.distanceMeter / 1000).toFixed(1)} km`
                : `${place.distanceMeter} m`}
            </Text>
          )}
          <Text style={styles.dot}>·</Text>
          <Text style={styles.category}>{place.subCategoryLabel}</Text>
        </View>
      </View>
      <ChevronRight size={18} color="#8A7A6D" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0ECE6',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
    marginRight: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  address: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  ratingCount: {
    fontSize: 10,
    color: '#8A7A6D',
  },
  dot: {
    color: '#8A7A6D',
    fontSize: 10,
  },
  category: {
    fontSize: 11,
    color: theme.colors.terracotta,
    fontWeight: '600',
  },
});
