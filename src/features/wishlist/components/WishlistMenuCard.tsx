import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Heart, Utensils } from 'lucide-react-native';
import { MenuWishlistItem } from '../../../models/menuWishlist';
import { DecorativeAssets } from '../../../config/assets';

interface WishlistMenuCardProps {
  item: MenuWishlistItem;
  onRemoveHeart?: () => void;
  onPress?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Makanan',
  drink: 'Minuman',
  dessert: 'Penutup',
  snack: 'Camilan',
};

const getCategoryFallbackImage = (category?: string) => {
  if (category === 'drink') return DecorativeAssets.iconCoffeeCup;
  if (category === 'dessert') return DecorativeAssets.iconCroissant;
  return DecorativeAssets.iconFoodCloche;
};

export const WishlistMenuCard: React.FC<WishlistMenuCardProps> = ({
  item,
  onRemoveHeart,
  onPress,
}) => {
  const fallback = getCategoryFallbackImage(item.category);
  const formattedPrice = item.estimatedPrice != null ? `Rp ${item.estimatedPrice.toLocaleString('id-ID')}` : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.imageCol}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Image source={fallback} style={styles.fallbackIcon} resizeMode="contain" />
          </View>
        )}
      </View>
      <View style={styles.contentCol}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.menuName}
          </Text>
          {onRemoveHeart && (
            <TouchableOpacity
              onPress={onRemoveHeart}
              accessibilityLabel="Hapus menu dari wishlist"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart size={16} color="#D04A1E" fill="#D04A1E" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.placeRow}>
          <Utensils size={11} color="#8A7A6D" />
          <Text style={styles.menuPlaceSubtitle} numberOfLines={1}>
            {item.placeName}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {formattedPrice && (
            <Text style={styles.menuPriceTag}>{formattedPrice}</Text>
          )}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_LABELS[item.category] || item.category}
              </Text>
            </View>
          )}
        </View>

        {item.notes ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            &quot;{item.notes}&quot;
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
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  thumbnailFallback: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    width: 44,
    height: 44,
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
  menuName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
    marginRight: 6,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  menuPlaceSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  menuPriceTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D04A1E',
  },
  categoryBadge: {
    backgroundColor: '#F7EFE6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A4A28',
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 11,
    color: '#6B5749',
    marginTop: 4,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
