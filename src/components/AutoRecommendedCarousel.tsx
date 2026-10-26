import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { NearbyPlace, MainCategory } from '../types/places';
import { theme } from '../config/theme';
import { Sparkles, Navigation, Star, Plus, BookmarkPlus } from 'lucide-react-native';

interface AutoRecommendedCarouselProps {
  locationDistrict?: string;
  places: NearbyPlace[];
  onAddDiary: (place: NearbyPlace) => void;
  onAddWishlist: (place: NearbyPlace) => void;
}

export const AutoRecommendedCarousel: React.FC<AutoRecommendedCarouselProps> = ({
  locationDistrict = 'Sekitar Anda',
  places,
  onAddDiary,
  onAddWishlist,
}) => {
  const [filter, setFilter] = useState<MainCategory>('all');

  const filteredPlaces = places.filter(p => filter === 'all' || p.mainCategory === filter);

  if (places.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header Rekomendasi Area */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sparkleBadge}>
            <Sparkles size={14} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>
              Rekomendasi di {locationDistrict}
            </Text>
            <Text style={styles.sectionSubtitle}>
              Spot terbaik dalam radius lokasi Anda saat ini
            </Text>
          </View>
        </View>
      </View>

      {/* Mini Filter: Semua, Food, Drinks, Wisata */}
      <View style={styles.filterRow}>
        {(
          [
            { id: 'all', label: 'Semua' },
            { id: 'food', label: '🍽️ Food' },
            { id: 'drinks', label: '☕ Drinks' },
            { id: 'wisata', label: '🎡 Wisata' },
          ] as Array<{ id: MainCategory; label: string }>
        ).map((item) => {
          const isSelected = filter === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.miniChip, isSelected && styles.miniChipActive]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.miniChipText,
                  isSelected && styles.miniChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {filteredPlaces.map((place) => {
          const formattedDistance =
            place.distanceMeter && place.distanceMeter >= 1000
              ? `${(place.distanceMeter / 1000).toFixed(1)} km`
              : `${place.distanceMeter || 300} m`;

          const fallbackImage =
            place.mainCategory === 'drinks'
              ? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
              : place.mainCategory === 'wisata'
              ? 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';

          return (
            <View key={place.id} style={styles.card}>
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: place.photoUrl || fallbackImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {place.mainCategory.toUpperCase()} • {place.subCategoryLabel}
                  </Text>
                </View>
                <View style={styles.distBadge}>
                  <Navigation size={10} color="#FFFFFF" />
                  <Text style={styles.distText}>{formattedDistance}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>

                <View style={styles.ratingRow}>
                  <Star size={12} color={theme.colors.amber} fill={theme.colors.amber} />
                  <Text style={styles.ratingText}>{place.ratingAverage || 4.8}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.visitText}>{place.userVisitedCount || 40}+ dikunjungi</Text>
                </View>

                {place.recommendationReason ? (
                  <Text style={styles.reasonText} numberOfLines={2}>
                    💡 {place.recommendationReason}
                  </Text>
                ) : null}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.wishlistBtn}
                    onPress={() => onAddWishlist(place)}
                  >
                    <BookmarkPlus size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => onAddDiary(place)}
                    activeOpacity={0.8}
                  >
                    <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.addBtnText}>Tulis Diary</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F4',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8DC',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 10,
  },
  miniChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
  },
  miniChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  miniChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    paddingLeft: theme.spacing.lg,
    paddingRight: 6,
  },
  card: {
    width: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginRight: 12,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageBox: {
    height: 115,
    position: 'relative',
    backgroundColor: '#F5EFEB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(43, 35, 33, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  distBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  cardBody: {
    padding: 10,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: 3,
  },
  dot: {
    marginHorizontal: 4,
    color: theme.colors.textTertiary,
    fontSize: 10,
  },
  visitText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  reasonText: {
    fontFamily: theme.fonts.handwriting,
    fontSize: 16,
    color: theme.colors.coffeeBrown,
    lineHeight: 20,
    backgroundColor: theme.colors.cream,
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  wishlistBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: '#E8E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    height: 32,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
});
