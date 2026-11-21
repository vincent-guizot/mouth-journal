import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert, Share } from 'react-native';
import { NearbyPlace } from '../types/places';
import { theme } from '../config/theme';
import { formatDistance } from '../utils/geo';
import { ArrowLeft, Star, Navigation, Bookmark, Share2, MapPin, Clock, Phone, Globe, ExternalLink, Edit3 } from 'lucide-react-native';

interface DetailPlaceScreenProps {
  place: NearbyPlace;
  isWishlisted: boolean;
  onBack: () => void;
  onWriteJournal: (place: NearbyPlace) => void;
  onToggleWishlist: () => void;
}

/**
 * Shows only data that exists for this place (OpenStreetMap tags). No invented
 * ratings, reviews, menus, phone numbers, websites or "similar places".
 */
export const DetailPlaceScreen: React.FC<DetailPlaceScreenProps> = ({
  place,
  isWishlisted,
  onBack,
  onWriteJournal,
  onToggleWishlist,
}) => {
  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Tidak dapat membuka tautan', err instanceof Error ? err.message : String(err));
    }
  };

  const mapsUrl = `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=18/${place.latitude}/${place.longitude}`;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`;

  const handleShare = async () => {
    try {
      await Share.share({ message: `${place.name}${place.address ? ` — ${place.address}` : ''}\n${mapsUrl}` });
    } catch (err) {
      Alert.alert('Gagal membagikan', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          {place.photoUrl ? (
            <Image source={{ uri: place.photoUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { alignItems: 'center', justifyContent: 'center' }]}>
              <MapPin size={42} color={theme.colors.terracotta} />
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8} accessibilityLabel="Kembali">
            <ArrowLeft size={20} color={theme.colors.coffeeBrown} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.placeTitle}>{place.name}</Text>
            {place.subCategoryLabel ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{place.subCategoryLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.ratingRow}>
            {place.ratingAverage !== undefined ? (
              <>
                <Star size={15} color={theme.colors.caramel} fill={theme.colors.caramel} />
                <Text style={styles.ratingScore}>{place.ratingAverage.toFixed(1)}</Text>
                {place.ratingCount !== undefined && <Text style={styles.reviewCount}>({place.ratingCount} ulasan)</Text>}
              </>
            ) : (
              <Text style={styles.reviewCount}>Belum ada rating untuk tempat ini</Text>
            )}
            {place.distanceMeter !== undefined && <Text style={styles.reviewCount}> · {formatDistance(place.distanceMeter)}</Text>}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtnItem} onPress={() => openUrl(routeUrl)}>
            <View style={styles.actionIconCircle}>
              <Navigation size={18} color={theme.colors.coffeeBrown} />
            </View>
            <Text style={styles.actionLabel}>Rute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnItem} onPress={onToggleWishlist}>
            <View style={[styles.actionIconCircle, isWishlisted && styles.actionIconCircleActive]}>
              <Bookmark
                size={18}
                color={isWishlisted ? '#FFFFFF' : theme.colors.coffeeBrown}
                fill={isWishlisted ? theme.colors.terracotta : 'transparent'}
              />
            </View>
            <Text style={styles.actionLabel}>{isWishlisted ? 'Di Wishlist' : 'Simpan'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnItem} onPress={handleShare}>
            <View style={styles.actionIconCircle}>
              <Share2 size={18} color={theme.colors.coffeeBrown} />
            </View>
            <Text style={styles.actionLabel}>Bagikan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.terracotta} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{place.address || 'Alamat tidak tercatat di OpenStreetMap'}</Text>
              <Text style={styles.infoSubtitle}>
                {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => openUrl(mapsUrl)} style={styles.rowActionBtn}>
              <ExternalLink size={16} color={theme.colors.coffeeBrown} />
            </TouchableOpacity>
          </View>

          {place.openingHours ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Clock size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>{place.openingHours}</Text>
                  <Text style={styles.infoSubtitle}>Jam buka menurut OpenStreetMap</Text>
                </View>
              </View>
            </>
          ) : null}

          {place.phone ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Phone size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>{place.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => openUrl(`tel:${place.phone!.replace(/[^0-9+]/g, '')}`)} style={styles.rowActionBtn}>
                  <Phone size={16} color={theme.colors.coffeeBrown} />
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {place.website ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Globe size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLinkText} numberOfLines={1}>
                    {place.website}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openUrl(place.website!)} style={styles.rowActionBtn}>
                  <ExternalLink size={16} color={theme.colors.coffeeBrown} />
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>

        {place.cuisine ? (
          <View style={styles.descSection}>
            <Text style={styles.descText}>Masakan: {place.cuisine.replace(/_/g, ' ').replace(/;/g, ', ')}</Text>
          </View>
        ) : null}

        <View style={styles.descSection}>
          <Text style={styles.reviewCount}>
            {place.providerId === 'osm' ? 'Data tempat © kontributor OpenStreetMap (ODbL).' : 'Tempat yang dimasukkan secara manual.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.writeJournalBtn} onPress={() => onWriteJournal(place)} activeOpacity={0.85}>
          <Edit3 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.writeJournalText}>Write Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#FAF5EE',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  mainInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeTitle: {
    flex: 1,
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginRight: 8,
  },
  categoryPill: {
    backgroundColor: theme.colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginLeft: 6,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  actionBtnItem: {
    alignItems: 'center',
    width: 75,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  actionIconCircleActive: {
    backgroundColor: theme.colors.terracotta,
    borderColor: theme.colors.terracotta,
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.coffeeBrown,
    textAlign: 'center',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DC',
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    paddingVertical: 10,
    marginRight: 24,
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: theme.colors.coffeeBrown,
  },
  tabText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.coffeeBrown,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: '#FAF5EE',
    marginHorizontal: theme.spacing.lg,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F0E8DC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  infoSubtitle: {
    fontSize: 11,
    color: theme.colors.espresso,
    marginTop: 1,
  },
  infoOpenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  infoLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  rowActionBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE3D3',
  },
  descSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: 14,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.espresso,
  },
  expandRow: {
    marginTop: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  popularMenuSection: {
    marginTop: 16,
    paddingLeft: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: theme.spacing.lg,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  menuScroll: {
    paddingRight: theme.spacing.lg,
  },
  menuItemCard: {
    width: 110,
    marginRight: 10,
  },
  menuItemImage: {
    width: 110,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  menuItemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.espresso,
    marginTop: 1,
  },

  /* AI Recommendations Section */
  aiSection: {
    backgroundColor: '#FDF7F0',
    marginHorizontal: theme.spacing.lg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3D5',
    marginBottom: theme.spacing.xl,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiHeaderTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
  },
  betaBadge: {
    backgroundColor: '#D04A1E',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  betaBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiHeaderSubtitle: {
    fontSize: 12,
    color: '#7D6A5D',
    lineHeight: 16,
    marginBottom: 12,
  },
  aiMenuScroll: {
    marginBottom: 12,
  },
  aiMenuCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  aiMenuImage: {
    width: '100%',
    height: 85,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#E8DFD8',
  },
  aiMenuName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  aiMenuReason: {
    fontSize: 10.5,
    color: '#8C7E74',
    lineHeight: 14,
    marginBottom: 4,
  },
  aiMenuPrice: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D04A1E',
  },
  whyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E5DC',
    gap: 6,
  },
  whyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  whyTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  whyText: {
    flex: 1,
    fontSize: 11.5,
    color: '#6B3F2E',
    lineHeight: 16,
  },

  /* Similar Places */
  similarPlaceCard: {
    width: 130,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  similarPlaceImage: {
    width: '100%',
    height: 75,
    borderRadius: 8,
    marginBottom: 6,
  },
  similarRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  similarRatingScore: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4E2E21',
  },
  similarAreaText: {
    fontSize: 10,
    color: '#8C7E74',
    marginTop: 1,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E8DC',
  },
  writeJournalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.coffeeBrown,
    paddingVertical: 14,
    borderRadius: 14,
    ...theme.shadows.card,
  },
  writeJournalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
