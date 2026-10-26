import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { theme } from '../config/theme';
import { DiaryEntry } from '../types/diary';
import { PhotoViewerScreen } from './PhotoViewerScreen';
import {
  ArrowLeft,
  Share2,
  Pencil,
  EllipsisVertical,
  Image as ImageIcon,
  MapPin,
  Coffee,
  Star,
  ChevronRight,
  Navigation,
  Bookmark,
  Map,
  Calendar,
  Clock,
  Users,
  Plus,
  MessageSquare,
  Utensils,
  Globe,
  MoreHorizontal,
} from 'lucide-react-native';

interface DetailJournalScreenProps {
  journal?: DiaryEntry | null;
  onBack: () => void;
  onEdit?: (journal: DiaryEntry) => void;
  onOpenMap?: () => void;
  onOpenPlaceDetail?: () => void;
}

export const DetailJournalScreen: React.FC<DetailJournalScreenProps> = ({
  journal,
  onBack,
  onEdit,
  onOpenMap,
  onOpenPlaceDetail,
}) => {
  // Gallery photos
  const defaultPhotos = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80', // Hero table with latte & croissant
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80', // Latte art
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80', // Croissant
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80', // Iced Americano
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80', // Cafe facade
  ];

  const photos =
    journal?.photoUrls && journal.photoUrls.length >= 3
      ? journal.photoUrls
      : defaultPhotos;

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const placeName = journal?.placeName || 'Tanamera Coffee Roastery';
  const placeAddress = journal?.placeAddress || 'Senopati, Jakarta Selatan';
  const categoryLabel = journal?.subCategoryLabel || 'Kopi/Cafe';
  const overallRating = journal?.overallRating || 4.2;
  const reviewText =
    journal?.reviewText ||
    'Tempatnya nyaman, kopi nya enak, croissantnya juga flaky banget. Cocok buat kerja sambil ngopi. Suasana nya tenang dan pelayanan ramah. Pasti akan balik lagi!';

  const criteria = journal?.criteriaRating || {
    taste: 4.5,
    ambiance: 4.5,
    service: 4.0,
    price: 4.5,
  };

  const menuItems =
    journal?.menuItems && journal.menuItems.length > 0
      ? journal.menuItems
      : [
          {
            id: 'm1',
            name: 'Latte',
            price: 45000,
            rating: 5.0,
            photo:
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
            desc: 'Latte art cantik, rasa creamy dan tidak terlalu pahit.',
          },
          {
            id: 'm2',
            name: 'Croissant',
            price: 38000,
            rating: 4.0,
            photo:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80',
            desc: 'Renyah di luar, lembut di dalam. Cocok banget dengan latte.',
          },
          {
            id: 'm3',
            name: 'Ice Americano',
            price: 35000,
            rating: 4.0,
            photo:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80',
            desc: 'Segar dan tidak terlalu asam.',
          },
        ];

  const tags = journal?.tags && journal.tags.length > 0
    ? journal.tags
    : ['Kopi/Cafe', 'Sarapan', 'Meeting', 'Teman'];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `MouthJournal: Mengunjungi ${placeName} (${placeAddress}). Rating: ${overallRating} ⭐\n"${reviewText}"`,
      });
    } catch {
      // Ignored
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      !isSaved ? 'Ditambahkan ke Wishlist' : 'Dihapus dari Wishlist',
      !isSaved
        ? `${placeName} berhasil disimpan ke daftar Wishlist.`
        : `${placeName} dihapus dari Wishlist.`
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => {
          const isFilled = i <= Math.floor(rating);
          const isHalf = !isFilled && i - rating <= 0.5;
          return (
            <Star
              key={i}
              size={13}
              color="#F39A28"
              fill={isFilled || isHalf ? '#F39A28' : 'none'}
              style={{ marginRight: 2 }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <TouchableOpacity
            style={styles.heroImageTouch}
            onPress={() => setIsPhotoViewerOpen(true)}
            activeOpacity={0.95}
          >
            <Image
              source={{ uri: photos[selectedPhotoIndex] || photos[0] }}
              style={styles.heroImage}
            />
          </TouchableOpacity>

          {/* Top Floating Action Header */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#4E2E21" />
            </TouchableOpacity>

            <View style={styles.topRightBtns}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Share2 size={18} color="#4E2E21" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => journal && onEdit && onEdit(journal)}
                activeOpacity={0.8}
              >
                <Pencil size={18} color="#4E2E21" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() =>
                  Alert.alert('Opsi Jurnal', 'Pilih opsi:', [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Bagikan ke Feed Publik', onPress: () => {} },
                    { text: 'Hapus Jurnal', style: 'destructive', onPress: onBack },
                  ])
                }
                activeOpacity={0.8}
              >
                <EllipsisVertical size={18} color="#4E2E21" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo Count Badge */}
          <TouchableOpacity
            style={styles.photoCountBadge}
            onPress={() => setIsPhotoViewerOpen(true)}
            activeOpacity={0.85}
          >
            <ImageIcon size={13} color="#FFFFFF" />
            <Text style={styles.photoCountText}>
              {selectedPhotoIndex + 1} / {photos.length}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Thumbnails Strip */}
        <View style={styles.thumbStripContainer}>
          {photos.slice(0, 5).map((uri, idx) => {
            const isSelected = idx === selectedPhotoIndex;
            const isLast = idx === 4 && photos.length >= 5;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbWrapper,
                  isSelected && styles.thumbWrapperActive,
                ]}
                onPress={() => setSelectedPhotoIndex(idx)}
                activeOpacity={0.8}
              >
                <Image source={{ uri }} style={styles.thumbImage} />
                {isLast && (
                  <View style={styles.thumbOverlay}>
                    <Text style={styles.thumbOverlayText}>+1</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Body */}
        <View style={styles.bodyContainer}>
          {/* Selected Place Card */}
          <TouchableOpacity
            style={styles.venueCard}
            onPress={onOpenPlaceDetail}
            activeOpacity={0.88}
          >
            <Image
              source={{
                uri:
                  photos[3] ||
                  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.venueThumb}
            />

            <View style={styles.venueInfo}>
              <Text style={styles.venueName} numberOfLines={1}>
                {placeName}
              </Text>

              <View style={styles.venueAddressRow}>
                <MapPin size={12} color="#8C7A70" />
                <Text style={styles.venueAddress} numberOfLines={1}>
                  {placeAddress}
                </Text>
              </View>

              <View style={styles.venueMetaRow}>
                <View style={styles.categoryPill}>
                  <Coffee size={11} color="#6B3F2E" />
                  <Text style={styles.categoryPillText}>{categoryLabel}</Text>
                </View>

                <View style={styles.ratingGroup}>
                  {renderStars(overallRating)}
                  <Text style={styles.ratingNumber}>{overallRating}</Text>
                  <Text style={styles.ratingVotes}>(1.2K)</Text>
                </View>
              </View>
            </View>

            <ChevronRight size={18} color="#B09B8E" />
          </TouchableOpacity>

          {/* Action Row: 4 Pill Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() =>
                Alert.alert(
                  'Buka Navigasi',
                  `Membuka petunjuk arah menuju ${placeName}...`
                )
              }
              activeOpacity={0.8}
            >
              <Navigation size={15} color="#D04A1E" />
              <Text style={styles.actionPillText}>Rute</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPill, isSaved && styles.actionPillActive]}
              onPress={handleToggleSave}
              activeOpacity={0.8}
            >
              <Bookmark
                size={15}
                color={isSaved ? '#D04A1E' : '#4E2E21'}
                fill={isSaved ? '#D04A1E' : 'none'}
              />
              <Text
                style={[
                  styles.actionPillText,
                  isSaved && { color: '#D04A1E', fontWeight: '700' },
                ]}
              >
                {isSaved ? 'Tersimpan' : 'Simpan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPill}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Share2 size={15} color="#4E2E21" />
              <Text style={styles.actionPillText}>Bagikan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPill}
              onPress={onOpenMap}
              activeOpacity={0.8}
            >
              <Map size={15} color="#4E2E21" />
              <Text style={styles.actionPillText}>Lihat di Peta</Text>
            </TouchableOpacity>
          </View>

          {/* Visit Info Card (3 Columns) */}
          <View style={styles.visitInfoCard}>
            <View style={styles.visitCol}>
              <Calendar size={18} color="#4E2E21" />
              <Text style={styles.visitColLabel}>Tanggal Kunjungan</Text>
              <Text style={styles.visitColValue}>12 Okt 2026</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.visitCol}>
              <Clock size={18} color="#4E2E21" />
              <Text style={styles.visitColLabel}>Waktu</Text>
              <Text style={styles.visitColValue}>10:30 - 12:15</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.visitCol}>
              <Users size={18} color="#4E2E21" />
              <Text style={styles.visitColLabel}>Bersama</Text>
              <Text style={styles.visitColValue}>Teman</Text>
            </View>
          </View>

          {/* Tags Row */}
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => {
              const isFirst = idx === 0;
              return (
                <View
                  key={idx}
                  style={[
                    styles.tagBadge,
                    isFirst ? styles.tagBadgeActive : styles.tagBadgeNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagBadgeText,
                      isFirst && styles.tagBadgeTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.tagBadgeAdd}
              onPress={() =>
                Alert.alert('Tambah Tag', 'Ketikkan tag baru untuk jurnal ini.')
              }
            >
              <Plus size={13} color="#6B3F2E" />
              <Text style={styles.tagBadgeAddText}>Tambah Tag</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Pengalaman Card (4 Columns) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Rating Pengalaman</Text>
            </View>

            <View style={styles.criteriaRow}>
              <View style={styles.criteriaCol}>
                <Text style={styles.criteriaLabel}>Rasa</Text>
                {renderStars(criteria.taste)}
                <Text style={styles.criteriaScore}>{criteria.taste.toFixed(1)}</Text>
              </View>

              <View style={styles.criteriaCol}>
                <Text style={styles.criteriaLabel}>Suasana</Text>
                {renderStars(criteria.ambiance)}
                <Text style={styles.criteriaScore}>{criteria.ambiance.toFixed(1)}</Text>
              </View>

              <View style={styles.criteriaCol}>
                <Text style={styles.criteriaLabel}>Pelayanan</Text>
                {renderStars(criteria.service)}
                <Text style={styles.criteriaScore}>{criteria.service.toFixed(1)}</Text>
              </View>

              <View style={styles.criteriaCol}>
                <Text style={styles.criteriaLabel}>Value for Money</Text>
                {renderStars(criteria.price)}
                <Text style={styles.criteriaScore}>{criteria.price.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          {/* Catatan / Review Card */}
          <View style={styles.sectionCard}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewHeaderLeft}>
                <View style={styles.sectionIconCircle}>
                  <MessageSquare size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Catatan / Review</Text>
              </View>

              <TouchableOpacity
                style={styles.editReviewBtn}
                onPress={() => journal && onEdit && onEdit(journal)}
                activeOpacity={0.8}
              >
                <Pencil size={11} color="#4E2E21" />
                <Text style={styles.editReviewBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewBodyBox}>
              <Text style={styles.reviewBodyText}>{reviewText}</Text>
            </View>
          </View>

          {/* Menu yang Dicoba Section */}
          <View style={styles.sectionCard}>
            <View style={styles.menuHeaderRow}>
              <View style={styles.reviewHeaderLeft}>
                <View style={styles.sectionIconCircle}>
                  <Utensils size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Menu yang Dicoba</Text>
              </View>

              <TouchableOpacity
                style={styles.menuPlaceBtn}
                onPress={onOpenPlaceDetail}
                activeOpacity={0.8}
              >
                <Text style={styles.menuPlaceBtnText}>Lihat Menu di Tempat</Text>
              </TouchableOpacity>
            </View>

            {/* Menu List */}
            <View style={styles.menuList}>
              {menuItems.map((item, index) => {
                const itemRating =
                  'rating' in item && typeof item.rating === 'number'
                    ? item.rating
                    : 4.5;
                const itemPhoto =
                  'photo' in item && typeof item.photo === 'string'
                    ? item.photo
                    : photos[index % photos.length];
                const itemDesc =
                  'desc' in item && typeof item.desc === 'string'
                    ? item.desc
                    : 'Menu rekomendasi pilihan dengan cita rasa khas.';

                const formattedPrice = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(item.price);

                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={styles.menuItemCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      Alert.alert(
                        item.name,
                        `${formattedPrice}\n\n${itemDesc}`
                      )
                    }
                  >
                    <Image source={{ uri: itemPhoto }} style={styles.menuThumb} />

                    <View style={styles.menuDetails}>
                      <View style={styles.menuTopLine}>
                        <Text style={styles.menuName}>{item.name}</Text>
                        <Text style={styles.menuPrice}>{formattedPrice}</Text>
                        <View style={styles.menuStarGroup}>
                          {renderStars(itemRating)}
                          <Text style={styles.menuRatingNumber}>
                            {itemRating.toFixed(1)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.menuDesc} numberOfLines={2}>
                        {itemDesc}
                      </Text>
                    </View>

                    <ChevronRight size={16} color="#B09B8E" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Meta Cards Row (3 side-by-side) */}
          <View style={styles.metaCardsRow}>
            {/* Card 1: Wishlist */}
            <View style={styles.metaSmallCard}>
              <View style={styles.metaIconCircle}>
                <Bookmark size={15} color="#D04A1E" fill="#D04A1E" />
              </View>
              <View style={styles.metaSmallContent}>
                <Text style={styles.metaSmallLabel}>Disimpan ke Wishlist</Text>
                <Text style={styles.metaSmallValue}>10 Okt 2026</Text>
              </View>
            </View>

            {/* Card 2: Visibility */}
            <View style={styles.metaSmallCard}>
              <View style={styles.metaIconCircle}>
                <Globe size={15} color="#4E2E21" />
              </View>
              <View style={styles.metaSmallContent}>
                <Text style={styles.metaSmallLabel}>Visibilitas</Text>
                <View style={styles.metaPublicRow}>
                  <Globe size={11} color="#6B3F2E" />
                  <Text style={styles.metaSmallValue}>Publik</Text>
                </View>
              </View>
            </View>

            {/* Card 3: More */}
            <TouchableOpacity
              style={styles.metaSmallCard}
              onPress={() =>
                Alert.alert('Informasi Tambahan', 'Jurnal ini dibuat dengan MouthJournal Mobile App.')
              }
              activeOpacity={0.8}
            >
              <View style={styles.metaIconCircle}>
                <MoreHorizontal size={15} color="#4E2E21" />
              </View>
              <View style={styles.metaSmallContent}>
                <Text style={styles.metaSmallLabel}>Lainnya</Text>
              </View>
              <ChevronRight size={14} color="#B09B8E" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Photo Viewer / Gallery Modal */}
      <Modal
        visible={isPhotoViewerOpen}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsPhotoViewerOpen(false)}
      >
        <PhotoViewerScreen
          photos={photos}
          initialIndex={selectedPhotoIndex}
          journal={journal}
          onClose={() => setIsPhotoViewerOpen(false)}
          onEditJournal={(j) => {
            setIsPhotoViewerOpen(false);
            if (onEdit) onEdit(j);
          }}
          onPlaceSelect={() => {
            setIsPhotoViewerOpen(false);
            if (onOpenPlaceDetail) onOpenPlaceDetail();
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 270,
    backgroundColor: '#3E2723',
  },
  heroImageTouch: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbStripContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  thumbWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F0E8DE',
  },
  thumbWrapperActive: {
    borderColor: '#D04A1E',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOverlayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  bodyContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 12,
  },
  venueCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DE',
    ...theme.shadows.card,
  },
  venueThumb: {
    width: 78,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  venueName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
  },
  venueAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  venueAddress: {
    fontSize: 11,
    color: '#7A675B',
    flex: 1,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF3EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B3F2E',
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
    marginLeft: 2,
  },
  ratingVotes: {
    fontSize: 10,
    color: '#9E8579',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FDF8F3',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E5D8',
  },
  actionPillActive: {
    backgroundColor: '#FFF2EB',
    borderColor: '#F7C9B2',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4E2E21',
  },
  visitInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  visitCol: {
    flex: 1,
    alignItems: 'center',
  },
  visitColLabel: {
    fontSize: 10,
    color: '#8C7A70',
    marginTop: 4,
  },
  visitColValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F0E8DE',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagBadgeActive: {
    backgroundColor: '#4E2E21',
  },
  tagBadgeNormal: {
    backgroundColor: '#F8F1EB',
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B3F2E',
  },
  tagBadgeTextActive: {
    color: '#FFFFFF',
  },
  tagBadgeAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D7C8',
    borderStyle: 'dashed',
    backgroundColor: '#FAF5EE',
  },
  tagBadgeAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B3F2E',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    ...theme.shadows.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4E2E21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 15,
    fontWeight: '800',
    color: '#4E2E21',
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  criteriaCol: {
    flex: 1,
    alignItems: 'center',
  },
  criteriaLabel: {
    fontSize: 11,
    color: '#7A675B',
    marginBottom: 4,
    textAlign: 'center',
  },
  criteriaScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4E2E21',
    marginTop: 4,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8EAD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
  },
  reviewBodyBox: {
    backgroundColor: '#FBF7F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E5D8',
  },
  reviewBodyText: {
    fontSize: 13,
    color: '#4E2E21',
    lineHeight: 19,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuPlaceBtn: {
    backgroundColor: '#F8EAD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  menuPlaceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B3F2E',
  },
  menuList: {
    gap: 10,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    alignItems: 'center',
  },
  menuThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  menuDetails: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  menuTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  menuName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  menuPrice: {
    fontSize: 12,
    color: '#7A675B',
  },
  menuStarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  menuRatingNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
    marginLeft: 3,
  },
  menuDesc: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 4,
    lineHeight: 15,
  },
  metaCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metaSmallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    ...theme.shadows.card,
  },
  metaIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8EAD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  metaSmallContent: {
    flex: 1,
  },
  metaSmallLabel: {
    fontSize: 9,
    color: '#8C7A70',
  },
  metaSmallValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
    marginTop: 1,
  },
  metaPublicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
});
