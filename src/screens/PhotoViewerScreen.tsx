import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Share,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../config/theme';
import { DiaryEntry } from '../types/diary';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Bookmark,
  Pencil,
  Trash,
  Star,
  Plus,
  Share2,
  Download,
  Info,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export interface PhotoViewerProps {
  visible?: boolean;
  photos?: string[];
  initialIndex?: number;
  journal?: DiaryEntry | null;
  onClose: () => void;
  onEditJournal?: (journal: DiaryEntry) => void;
  onDeleteJournal?: (journalId: string) => void;
  onPlaceSelect?: (placeName: string) => void;
}

export const PhotoViewerScreen: React.FC<PhotoViewerProps> = ({
  visible = true,
  photos: propPhotos,
  initialIndex = 0,
  journal,
  onClose,
  onEditJournal,
  onDeleteJournal,
  onPlaceSelect,
}) => {
  // Master fallback photos matching the 4 design screens
  const defaultPhotos = [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80', // Steak & coffee (Screen 1)
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=1200&auto=format&fit=crop&q=80', // Strawberry pancake (Screen 2)
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&auto=format&fit=crop&q=80', // Latte art (Screen 3)
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&auto=format&fit=crop&q=80', // Croissant
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1200&auto=format&fit=crop&q=80', // Cafe ambiance
  ];

  const photos =
    propPhotos && propPhotos.length > 0
      ? propPhotos
      : journal?.photoUrls && journal.photoUrls.length > 0
      ? journal.photoUrls
      : defaultPhotos;

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(initialIndex, 0), photos.length - 1)
  );

  // UI States
  const [showDetailsSheet, setShowDetailsSheet] = useState(false); // Screen 3 state
  const [showActionSheet, setShowActionSheet] = useState(false); // Screen 4 state
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Journal Metadata
  const venueName = journal?.placeName || 'Zona Nyaman Coffee';
  const venueAddress = journal?.placeAddress || 'Kemanggisan, Jakarta Barat';
  const dateStr = journal?.visitedAt
    ? new Date(journal.visitedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '12 Okt 2026';
  const timeStr = '10:30';
  const companionStr = 'Teman';
  const reviewContent =
    journal?.reviewText ||
    'Tempatnya nyaman, kopi nya enak, croissantnya juga flaky banget. Pasti akan balik lagi!';
  const tags = journal?.tags && journal.tags.length > 0
    ? journal.tags
    : ['Nyaman', 'Kopi Enak', 'Suasana Cozy'];
  const ratingScore = journal?.overallRating || 4.0;

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(photos.length - 1); // Loop to end
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Lihat momen kuliner di ${venueName} melalui MouthJournal: ${photos[currentIndex]}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleSaveToGallery = () => {
    setShowActionSheet(false);
    Alert.alert('Simpan Foto', 'Foto berhasil disimpan ke galeri perangkat kamu.');
  };

  const handleSetPrimary = () => {
    setShowActionSheet(false);
    Alert.alert('Foto Utama Diperbarui', 'Foto ini sekarang dijadikan sampul utama jurnal.');
  };

  const handleDeletePhoto = () => {
    setShowActionSheet(false);
    Alert.alert(
      'Hapus Foto',
      'Apakah kamu yakin ingin menghapus foto ini dari jurnal kuliner?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (photos.length > 1) {
              if (currentIndex >= photos.length - 1) {
                setCurrentIndex(photos.length - 2);
              }
              Alert.alert('Foto Dihapus', 'Foto berhasil dihapus.');
            } else {
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleDeleteJournal = () => {
    Alert.alert(
      'Hapus Jurnal',
      `Yakin ingin menghapus seluruh jurnal "${venueName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Jurnal',
          style: 'destructive',
          onPress: () => {
            if (journal && onDeleteJournal) {
              onDeleteJournal(journal.id);
            }
            onClose();
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Fullscreen Image View */}
      <TouchableWithoutFeedback
        onPress={() => {
          if (showDetailsSheet) {
            setShowDetailsSheet(false);
          } else {
            setShowControls(!showControls);
          }
        }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photos[currentIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Subtle vignette gradient overlays */}
          <View style={styles.topVignette} pointerEvents="none" />
          <View style={styles.bottomVignette} pointerEvents="none" />
        </View>
      </TouchableWithoutFeedback>

      {/* Floating Top Bar (Header) */}
      {showControls && (
        <View style={styles.topBar}>
          {/* Close Button (✕) */}
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Indicator Counter (e.g. 1 / 5) */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>

          {/* Right Header Options (Info & More) */}
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[
                styles.iconCircleBtn,
                showDetailsSheet && styles.iconCircleBtnActive,
              ]}
              onPress={() => setShowDetailsSheet(!showDetailsSheet)}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setShowActionSheet(true)}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Left Chevron Navigation Button */}
      {showControls && photos.length > 1 && (
        <TouchableOpacity
          style={styles.chevronLeftBtn}
          onPress={handlePrev}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Right Chevron Navigation Button */}
      {showControls && photos.length > 1 && (
        <TouchableOpacity
          style={styles.chevronRightBtn}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <ChevronRight size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* ======================================================== */}
      {/* SCREEN 1 & 2: Bottom Thumbnail Strip                     */}
      {/* ======================================================== */}
      {showControls && !showDetailsSheet && (
        <View style={styles.bottomThumbStripContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbScrollContent}
          >
            {photos.map((uri, idx) => {
              const isActive = idx === currentIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbTile,
                    isActive && styles.thumbTileActive,
                  ]}
                  onPress={() => setCurrentIndex(idx)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri }} style={styles.thumbImage} />
                  {isActive && <View style={styles.thumbActiveHighlight} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quick Info Bar Pill to open details */}
          <TouchableOpacity
            style={styles.quickInfoPill}
            onPress={() => setShowDetailsSheet(true)}
            activeOpacity={0.85}
          >
            <View style={styles.quickInfoLeft}>
              <MapPin size={12} color="#D04A1E" />
              <Text style={styles.quickInfoTitle} numberOfLines={1}>
                {venueName}
              </Text>
            </View>
            <Text style={styles.quickInfoHint}>Ketuk untuk detail</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: Collapsible Journal Details Bottom Sheet       */}
      {/* ======================================================== */}
      {showDetailsSheet && (
        <View style={styles.detailsBottomSheet}>
          {/* Top Drag Handle */}
          <TouchableOpacity
            style={styles.dragHandleTouch}
            onPress={() => setShowDetailsSheet(false)}
            activeOpacity={0.8}
          >
            <View style={styles.dragHandleBar} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailsScrollContent}
          >
            {/* Venue Header */}
            <TouchableOpacity
              style={styles.venueRow}
              onPress={() => onPlaceSelect && onPlaceSelect(venueName)}
              activeOpacity={0.7}
            >
              <View style={styles.venueTitleContainer}>
                <Text style={styles.venueName}>{venueName}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={13} color="#D04A1E" />
                  <Text style={styles.addressText}>{venueAddress}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#C4B5A5" />
            </TouchableOpacity>

            {/* Meta Row: Date, Time, Companions */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={13} color="#D04A1E" />
                <Text style={styles.metaText}>{dateStr}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={13} color="#D04A1E" />
                <Text style={styles.metaText}>{timeStr}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={13} color="#D04A1E" />
                <Text style={styles.metaText}>{companionStr}</Text>
              </View>
            </View>

            {/* Review / Story Caption */}
            <Text style={styles.reviewText}>{reviewContent}</Text>

            {/* Tags Row */}
            <View style={styles.tagsRow}>
              {tags.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addTagBtn}
                onPress={() =>
                  Alert.alert('Tambah Tag', 'Fitur edit tag tersedia di Edit Journal.')
                }
              >
                <Plus size={12} color="#E8DFD8" />
              </TouchableOpacity>
            </View>

            {/* Overall Rating Row */}
            <View style={styles.ratingRow}>
              <View style={styles.starsGroup}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    color="#F39A28"
                    fill={s <= Math.floor(ratingScore) ? '#F39A28' : 'transparent'}
                  />
                ))}
              </View>
              <Text style={styles.ratingScoreText}>{ratingScore.toFixed(1)}</Text>
            </View>

            {/* Action Bar (Heart, Bookmark, Edit, Trash) */}
            <View style={styles.actionToolbar}>
              {/* Suka */}
              <TouchableOpacity
                style={styles.actionCol}
                onPress={() => setIsLiked(!isLiked)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    isLiked && styles.actionIconCircleActive,
                  ]}
                >
                  <Heart
                    size={18}
                    color={isLiked ? '#D04A1E' : '#FFFFFF'}
                    fill={isLiked ? '#D04A1E' : 'transparent'}
                  />
                </View>
                <Text style={styles.actionLabel}>Suka</Text>
              </TouchableOpacity>

              {/* Simpan */}
              <TouchableOpacity
                style={styles.actionCol}
                onPress={() => setIsSaved(!isSaved)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    isSaved && styles.actionIconCircleActive,
                  ]}
                >
                  <Bookmark
                    size={18}
                    color={isSaved ? '#F39A28' : '#FFFFFF'}
                    fill={isSaved ? '#F39A28' : 'transparent'}
                  />
                </View>
                <Text style={styles.actionLabel}>Simpan</Text>
              </TouchableOpacity>

              {/* Edit */}
              <TouchableOpacity
                style={styles.actionCol}
                onPress={() => {
                  setShowDetailsSheet(false);
                  if (journal && onEditJournal) {
                    onClose();
                    onEditJournal(journal);
                  } else {
                    Alert.alert('Edit Journal', 'Membuka editor jurnal...');
                  }
                }}
                activeOpacity={0.75}
              >
                <View style={styles.actionIconCircle}>
                  <Pencil size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionLabel}>Edit</Text>
              </TouchableOpacity>

              {/* Hapus */}
              <TouchableOpacity
                style={styles.actionCol}
                onPress={handleDeleteJournal}
                activeOpacity={0.75}
              >
                <View style={styles.actionIconCircle}>
                  <Trash size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionLabel}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* SCREEN 4: More Options Modal / Action Sheet              */}
      {/* ======================================================== */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowActionSheet(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.actionSheetContainer}>
                {/* Drag Handle */}
                <View style={styles.sheetHandleBar} />

                {/* Header with Photo Thumbnail & Venue Info */}
                <View style={styles.sheetHeader}>
                  <Image
                    source={{ uri: photos[currentIndex] }}
                    style={styles.sheetHeaderThumb}
                  />
                  <View style={styles.sheetHeaderInfo}>
                    <Text style={styles.sheetHeaderTitle}>{venueName}</Text>
                    <Text style={styles.sheetHeaderSubtitle}>
                      {dateStr} • {photos.length} foto
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.sheetCloseBtn}
                    onPress={() => setShowActionSheet(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={16} color="#4E2E21" />
                  </TouchableOpacity>
                </View>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {/* Bagikan */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => {
                      setShowActionSheet(false);
                      handleShare();
                    }}
                    activeOpacity={0.7}
                  >
                    <Share2 size={19} color="#4E2E21" />
                    <Text style={styles.optionLabel}>Bagikan ke...</Text>
                  </TouchableOpacity>

                  {/* Simpan ke Galeri */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={handleSaveToGallery}
                    activeOpacity={0.7}
                  >
                    <Download size={19} color="#4E2E21" />
                    <Text style={styles.optionLabel}>Simpan ke Galeri</Text>
                  </TouchableOpacity>

                  {/* Jadikan Foto Utama */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={handleSetPrimary}
                    activeOpacity={0.7}
                  >
                    <Star size={19} color="#4E2E21" />
                    <Text style={styles.optionLabel}>Jadikan Foto Utama</Text>
                  </TouchableOpacity>

                  {/* Edit Foto */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => {
                      setShowActionSheet(false);
                      Alert.alert(
                        'Edit Foto',
                        'Membuka alat filter & rotasi foto kuliner...'
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Pencil size={19} color="#4E2E21" />
                    <Text style={styles.optionLabel}>Edit Foto</Text>
                  </TouchableOpacity>

                  {/* Hapus Foto */}
                  <TouchableOpacity
                    style={[styles.optionRow, styles.optionRowDestructive]}
                    onPress={handleDeletePhoto}
                    activeOpacity={0.7}
                  >
                    <Trash size={19} color="#DC2626" />
                    <Text style={styles.optionLabelDestructive}>Hapus Foto</Text>
                  </TouchableOpacity>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowActionSheet(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B0A',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B0A',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  /* Top Bar */
  topBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconCircleBtnActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  counterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  /* Chevrons */
  chevronLeftBtn: {
    position: 'absolute',
    left: 14,
    top: height * 0.42,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 15,
  },
  chevronRightBtn: {
    position: 'absolute',
    right: 14,
    top: height * 0.42,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 15,
  },

  /* Bottom Thumbnail Strip (Screen 1 & 2) */
  bottomThumbStripContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    gap: 10,
  },
  thumbScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  thumbTile: {
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    position: 'relative',
    backgroundColor: '#2A1F1B',
  },
  thumbTileActive: {
    borderColor: '#D04A1E',
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbActiveHighlight: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1.5,
    borderColor: '#F39A28',
    borderRadius: 8,
  },
  quickInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 19, 16, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: width * 0.88,
  },
  quickInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  quickInfoTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  quickInfoHint: {
    color: '#D04A1E',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Collapsible Details Bottom Sheet (Screen 3) */
  detailsBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 16, 13, 0.96)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 30,
    maxHeight: height * 0.55,
  },
  dragHandleTouch: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailsScrollContent: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  venueTitleContainer: {
    flex: 1,
  },
  venueName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 19,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12.5,
    color: '#C4B5A5',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#E8DFD8',
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 13.5,
    color: '#E8DFD8',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tagText: {
    fontSize: 11.5,
    color: '#E8DFD8',
    fontWeight: '500',
  },
  addTagBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 3,
  },
  ratingScoreText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Action Toolbar (Suka, Simpan, Edit, Hapus) */
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionCol: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionIconCircleActive: {
    backgroundColor: 'rgba(208, 74, 30, 0.25)',
    borderColor: '#D04A1E',
  },
  actionLabel: {
    fontSize: 11.5,
    color: '#C4B5A5',
    fontWeight: '500',
  },

  /* Action Sheet Modal (Screen 4) */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#FAF5EE',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D7C4B7',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
  },
  sheetHeaderThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E8DFD8',
  },
  sheetHeaderInfo: {
    flex: 1,
  },
  sheetHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  sheetHeaderSubtitle: {
    fontSize: 12,
    color: '#8C7E74',
    fontWeight: '500',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFE7DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 4,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 6,
  },
  optionRowDestructive: {
    borderTopWidth: 1,
    borderTopColor: '#F0E5DC',
    marginTop: 4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4E2E21',
  },
  optionLabelDestructive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFE7DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4E2E21',
  },
});
