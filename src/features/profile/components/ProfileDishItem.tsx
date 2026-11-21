import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, Utensils, ThumbsUp } from 'lucide-react-native';
import { LoggedDish } from '../profileAggregation';
import { theme } from '../../../config/theme';

interface ProfileDishItemProps {
  dish: LoggedDish;
  onPress?: () => void;
}

export const ProfileDishItem: React.FC<ProfileDishItemProps> = ({ dish, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.contentRow}>
        {dish.photoUrl ? (
          <Image source={{ uri: dish.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Utensils size={20} color={theme.colors.terracotta} />
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={styles.dishName} numberOfLines={1}>
              {dish.dishName}
            </Text>
            {dish.rating ? (
              <View style={styles.ratingBadge}>
                <Star size={11} color="#F39A28" fill="#F39A28" />
                <Text style={styles.ratingText}>{dish.rating}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.placeText} numberOfLines={1}>
            di {dish.placeName}
          </Text>

          {dish.notes ? (
            <Text style={styles.notesText} numberOfLines={1}>
              &ldquo;{dish.notes}&rdquo;
            </Text>
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.priceText}>
              Rp {dish.price.toLocaleString('id-ID')}
            </Text>
            {dish.isRecommended ? (
              <View style={styles.recBadge}>
                <ThumbsUp size={10} color="#16A34A" />
                <Text style={styles.recText}>Rekomendasi</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#FAF5EE',
  },
  placeholderThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34150E',
    flex: 1,
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  placeText: {
    fontSize: 12,
    color: '#7A685D',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 11,
    color: '#9C887B',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
});
