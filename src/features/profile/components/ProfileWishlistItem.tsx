import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MapPin, Heart } from 'lucide-react-native';
import { WishlistItem } from '../../../models/wishlist';
import { theme } from '../../../config/theme';

interface ProfileWishlistItemProps {
  item: WishlistItem;
  onPress?: () => void;
}

export const ProfileWishlistItem: React.FC<ProfileWishlistItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.contentRow}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Heart size={20} color={theme.colors.terracotta} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.placeName}
          </Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.subCategoryLabel || 'Kuliner'}</Text>
          </View>

          {item.placeAddress ? (
            <View style={styles.locationRow}>
              <MapPin size={11} color={theme.colors.terracotta} />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.placeAddress}
              </Text>
            </View>
          ) : null}

          {item.personalNotes ? (
            <Text style={styles.notesText} numberOfLines={1}>
              &ldquo;{item.personalNotes}&rdquo;
            </Text>
          ) : null}
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
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34150E',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7F3EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: '#6E5D53',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 11,
    color: '#7A685D',
    flex: 1,
  },
  notesText: {
    fontSize: 11,
    color: '#9C887B',
    fontStyle: 'italic',
  },
});
