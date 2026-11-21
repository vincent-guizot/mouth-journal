import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, MapPin, Calendar, Repeat } from 'lucide-react-native';
import { VisitedPlace } from '../profileAggregation';
import { theme } from '../../../config/theme';

interface ProfilePlaceItemProps {
  place: VisitedPlace;
  onPress?: () => void;
}

export const ProfilePlaceItem: React.FC<ProfilePlaceItemProps> = ({ place, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      {place.photoUrl ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: place.photoUrl }} style={styles.photo} resizeMode="cover" />
        </View>
      ) : null}

      <View style={styles.infoBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.placeName}
          </Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#F39A28" fill="#F39A28" />
            <Text style={styles.ratingText}>{place.averageRating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{place.subCategoryLabel || 'Kuliner'}</Text>
        </View>

        {place.placeAddress ? (
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.colors.terracotta} />
            <Text style={styles.addressText} numberOfLines={1}>
              {place.placeAddress}
            </Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.badgeItem}>
            <Repeat size={12} color="#7A685D" />
            <Text style={styles.metaText}>{place.visitCount}x dikunjungi</Text>
          </View>

          <View style={styles.badgeItem}>
            <Calendar size={12} color="#7A685D" />
            <Text style={styles.metaText}>
              Terakhir {new Date(place.lastVisited).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  photoContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#FAF5EE',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  infoBlock: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34150E',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7F3EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#6E5D53',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 12,
    color: '#7A685D',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F7F3EE',
    paddingTop: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#7A685D',
  },
});
