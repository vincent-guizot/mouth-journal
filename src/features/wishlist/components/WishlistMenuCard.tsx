import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { WishlistMenuItem } from '../../../mocks/data/mockWishlist';

interface WishlistMenuCardProps {
  item: WishlistMenuItem;
  onRemoveHeart?: () => void;
}

export const WishlistMenuCard: React.FC<WishlistMenuCardProps> = ({
  item,
  onRemoveHeart,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageCol}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="cover" />
      </View>
      <View style={styles.contentCol}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={onRemoveHeart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Heart size={16} color="#D04A1E" fill="#D04A1E" />
          </TouchableOpacity>
        </View>
        <Text style={styles.menuPlaceSubtitle}>{item.placeName}</Text>
        <Text style={styles.menuPriceTag}>{item.price}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          "{item.notes}"
        </Text>
      </View>
    </View>
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
  menuPlaceSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
  menuPriceTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D04A1E',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 11,
    color: '#6B5749',
    marginTop: 4,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
