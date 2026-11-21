import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DiaryEntry } from '../types/diary';
import { theme } from '../config/theme';
import { RatingStars } from './RatingStars';
import { MapPin, MoreHorizontal, Images } from 'lucide-react-native';

interface DiaryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
  onMorePress?: () => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({
  entry,
  onPress,
  onMorePress,
}) => {
  const formattedDate = new Date(entry.visitedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const photoCount = entry.photoUrls.length;


  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* 1. Kolom Kiri: Foto Utama dengan Badge Jumlah Foto */}
      <View style={styles.imageCol}>
        {photoCount > 0 ? (
          <Image source={{ uri: entry.photoUrls[0] }} style={styles.mainImage} resizeMode="cover" />
        ) : (
          <View style={[styles.mainImage, { backgroundColor: '#FAF5EE' }]} />
        )}
        {photoCount > 0 && (
        <View style={styles.photoCountBadge}>
          <Images size={11} color="#FFFFFF" />
          <Text style={styles.photoCountText}>{photoCount}</Text>
        </View>
        )}
      </View>

      {/* 2. Kolom Kanan: Detail Tempat, Rating, Menu & Catatan */}
      <View style={styles.contentCol}>
        {/* Baris Atas: Tanggal & Menu Tiga Titik */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <TouchableOpacity onPress={onMorePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MoreHorizontal size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Nama Tempat & Badge Kategori */}
        <View style={styles.titleRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {entry.placeName}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {entry.subCategoryLabel || (entry.mainCategory === 'drinks' ? 'Kopi/Cafe' : entry.mainCategory === 'wisata' ? 'Wisata' : 'Restoran')}
            </Text>
          </View>
        </View>

        {/* Baris Lokasi */}
        <View style={styles.locationRow}>
          <MapPin size={11} color={theme.colors.terracotta} />
          <Text style={styles.placeAddress} numberOfLines={1}>
            {entry.placeAddress}
          </Text>
        </View>

        {/* Rating Bintang */}
        <View style={styles.ratingRow}>
          <RatingStars rating={entry.overallRating} size={13} showScore />
        </View>

        {/* Dua Thumbnail Mini Menu yang Dipesan */}
        {entry.menuItems && entry.menuItems.length > 0 && (
          <View style={styles.miniMenuRow}>
            {entry.menuItems.slice(0, 2).map((item, idx) => (
              <View key={item.id || idx} style={styles.miniMenuCard}>
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.miniMenuImg} />
                ) : (
                  <View style={[styles.miniMenuImg, { backgroundColor: '#FAF5EE' }]} />
                )}
                <View style={styles.miniMenuInfo}>
                  <Text style={styles.miniMenuName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.miniMenuPrice}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Catatan Review Handwriting */}
        <Text style={styles.reviewText} numberOfLines={2}>
          {entry.reviewText}
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
    marginBottom: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0E8DC',
    ...theme.shadows.card,
  },
  imageCol: {
    width: 135,
    height: 165,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5EFEB',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoCountText: {
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  placeName: {
    flex: 1,
    fontFamily: theme.fonts.serifBold,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginRight: 6,
  },
  categoryBadge: {
    backgroundColor: theme.colors.cream,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  placeAddress: {
    fontSize: 11,
    color: theme.colors.espresso,
    marginLeft: 3,
  },
  ratingRow: {
    marginVertical: 3,
  },
  miniMenuRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  miniMenuCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 8,
    padding: 4,
    marginRight: 4,
  },
  miniMenuImg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    marginRight: 5,
  },
  miniMenuInfo: {
    flex: 1,
  },
  miniMenuName: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  miniMenuPrice: {
    fontSize: 9,
    color: theme.colors.terracotta,
    fontWeight: '700',
  },
  reviewText: {
    fontFamily: theme.fonts.handwriting,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
