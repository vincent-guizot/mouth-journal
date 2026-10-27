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
  Calendar,
  Plus,
  MessageSquare,
  Utensils,
  Globe,
  MoreHorizontal,
  Tag as TagIcon,
  CheckCircle2,
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

  const placeName = journal?.placeName || 'Tanamera Coffee Roastery';
  const placeAddress = journal?.placeAddress || 'Senopati, Jakarta Selatan';
  const categoryLabel = journal?.subCategoryLabel || 'Kopi/Cafe';
  const overallRating = journal?.overallRating || 4.2;
  const visitDateLabel = new Date(journal?.visitedAt || Date.now()).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
        {/* Hero Image Section with Layered Cafe Name & Actions */}
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
            {/* Scrim/Dark Gradient Overlay */}
            <View style={styles.heroScrimOverlay} />
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

          {/* Layered Content: Nama Tempat, Kategori, Rating, Rute & Bagikan */}
          <View style={styles.heroBottomLayer}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroCategoryPill}>
                <Coffee size={12} color="#FFFFFF" />
                <Text style={styles.heroCategoryText}>{categoryLabel}</Text>
              </View>

              <View style={styles.heroRatingBadge}>
                <Star size={12} color="#F39A28" fill="#F39A28" />
                <Text style={styles.heroRatingText}>{overallRating}</Text>
                <Text style={styles.heroVotesText}>(1.2K)</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onOpenPlaceDetail}
              activeOpacity={0.9}
              style={styles.heroTitleRow}
            >
              <Text style={styles.heroPlaceName} numberOfLines={2}>
                {placeName}
              </Text>
              <ChevronRight size={22} color="rgba(255,255,255,0.8)" style={{ marginLeft: 6, marginTop: 4 }} />
            </TouchableOpacity>

            <View style={styles.heroAddressRow}>
              <MapPin size={13} color="#FFB199" />
              <Text style={styles.heroAddressText} numberOfLines={1}>
                {placeAddress}
              </Text>
            </View>

            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={styles.heroRouteBtn}
                onPress={onOpenMap}
                activeOpacity={0.85}
              >
                <Navigation size={15} color="#FFFFFF" />
                <Text style={styles.heroRouteBtnText}>Rute</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroShareBtn}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Share2 size={15} color="#FFFFFF" />
                <Text style={styles.heroShareBtnText}>Bagikan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Horizontal Thumbnails Strip (Di bawah nama cafe: foto-foto) */}
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
                    <Text style={styles.thumbOverlayText}>+{photos.length - 4}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Body */}
        <View style={styles.bodyContainer}>
          {/* 1. Menu yang Dicoba Section (Di bawah nama cafe & foto-foto) */}
          <View style={styles.sectionCard}>
            <View style={styles.menuHeaderRow}>
              <View style={styles.reviewHeaderLeft}>
                <View style={styles.sectionIconCircle}>
                  <Utensils size={13} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Menu yang Dicoba</Text>
                  <Text style={styles.sectionSubtitle}>{menuItems.length} menu diunggah</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.menuPlaceBtn}
                onPress={onOpenPlaceDetail}
                activeOpacity={0.8}
              >
                <Text style={styles.menuPlaceBtnText}>Lihat Semua Menu</Text>
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
                      </View>
                      <View style={styles.menuStarGroup}>
                        {renderStars(itemRating)}
                        <Text style={styles.menuRatingNumber}>
                          {itemRating.toFixed(1)}
                        </Text>
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

          {/* 2. Tanggal Kunjungan (Redesign Rapi) */}
          <View style={styles.visitDateCard}>
            <View style={styles.visitDateIconWrapper}>
              <Calendar size={20} color="#D04A1E" />
            </View>
            <View style={styles.visitDateInfo}>
              <Text style={styles.visitDateSub}>TANGGAL KUNJUNGAN</Text>
              <Text style={styles.visitDateMain}>{visitDateLabel}</Text>
            </View>
            <View style={styles.visitStatusBadge}>
              <CheckCircle2 size={13} color="#2E7D32" />
              <Text style={styles.visitStatusText}>Tercatat</Text>
            </View>
          </View>

          {/* 3. Tag Jurnal (Redesign Rapi) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <TagIcon size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Tag Jurnal</Text>
            </View>

            <View style={styles.tagsContainer}>
              {tags.map((tag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tagBadge,
                    idx === 0 && styles.tagBadgeFirst,
                  ]}
                >
                  <Text style={[styles.tagHash, idx === 0 && styles.tagHashFirst]}>#</Text>
                  <Text
                    style={[
                      styles.tagBadgeText,
                      idx === 0 && styles.tagBadgeTextFirst,
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.tagBadgeAdd}
                onPress={() =>
                  Alert.alert('Tambah Tag', 'Ketikkan tag baru untuk jurnal ini.')
                }
              >
                <Plus size={13} color="#D04A1E" />
                <Text style={styles.tagBadgeAddText}>Tambah Tag</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Rating Pengalaman Card (4 Columns) */}
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

          {/* 5. Catatan / Review Card */}
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

          {/* 6. Bottom Meta Cards Row */}
          <View style={styles.metaCardsRow}>
            {/* Visibility */}
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

            {/* Journal information */}
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
                <Text style={styles.metaSmallLabel}>Info Jurnal</Text>
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
    height: 350,
    backgroundColor: '#2A1810',
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
  heroScrimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 12, 6, 0.45)',
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
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
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  heroBottomLayer: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    gap: 6,
    zIndex: 10,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: theme.fonts.medium,
  },
  heroRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: theme.fonts.bold,
  },
  heroVotesText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroPlaceName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroAddressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.92)',
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  heroRouteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D04A1E',
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  heroRouteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: theme.fonts.bold,
  },
  heroShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroShareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: theme.fonts.bold,
  },
  thumbStripContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
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
    marginTop: 8,
    gap: 12,
  },
  visitDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  visitDateIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7C9B2',
  },
  visitDateInfo: {
    flex: 1,
  },
  visitDateSub: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: '#8C7A70',
    fontFamily: theme.fonts.bold,
  },
  visitDateMain: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
    marginTop: 2,
    fontFamily: theme.fonts.bold,
  },
  visitStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  visitStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
    fontFamily: theme.fonts.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  tagBadgeFirst: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  tagHash: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D04A1E',
    marginRight: 3,
  },
  tagHashFirst: {
    color: '#FFB199',
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B3F2E',
    fontFamily: theme.fonts.medium,
  },
  tagBadgeTextFirst: {
    color: '#FFFFFF',
  },
  tagBadgeAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D04A1E',
    borderStyle: 'dashed',
    backgroundColor: '#FFF8F5',
  },
  tagBadgeAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D04A1E',
    fontFamily: theme.fonts.medium,
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
  sectionSubtitle: {
    fontSize: 10,
    color: '#8C7A70',
    marginTop: 1,
    fontFamily: theme.fonts.regular,
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
    fontFamily: theme.fonts.regular,
  },
  criteriaScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4E2E21',
    marginTop: 4,
    fontFamily: theme.fonts.bold,
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
    fontFamily: theme.fonts.bold,
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
    fontFamily: theme.fonts.regular,
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
    fontFamily: theme.fonts.bold,
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
    fontFamily: theme.fonts.bold,
  },
  menuPrice: {
    fontSize: 12,
    color: '#7A675B',
    fontFamily: theme.fonts.regular,
  },
  menuStarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRatingNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
    marginLeft: 3,
    fontFamily: theme.fonts.bold,
  },
  menuDesc: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 4,
    lineHeight: 15,
    fontFamily: theme.fonts.regular,
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
    fontFamily: theme.fonts.regular,
  },
  metaSmallValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
    marginTop: 1,
    fontFamily: theme.fonts.bold,
  },
  metaPublicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
});
