import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { theme } from '../config/theme';
import { DiaryEntry } from '../types/diary';
import { ImageService } from '../services/firebase/imageService';
import {
  ArrowLeft,
  Trash,
  X,
  Camera,
  Pencil,
  MapPin,
  Calendar,
  Clock,
  Utensils,
  Coffee,
  Cake,
  Croissant,
  Star,
  ChevronRight,
  Plus,
  Globe,
  Lock,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface EditJournalScreenProps {
  journal?: DiaryEntry | null;
  onBack: () => void;
  onSave: (updatedJournal: DiaryEntry) => void;
  onDelete?: (journalId: string) => void;
}

export const EditJournalScreen: React.FC<EditJournalScreenProps> = ({
  journal,
  onBack,
  onSave,
  onDelete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Photos
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', // Steak & coffee hero
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&auto=format&fit=crop&q=80', // Strawberry pancake
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&auto=format&fit=crop&q=80', // Cafe interior
  ]);

  // Basic Info
  const [placeName, setPlaceName] = useState(
    journal?.placeName || 'Zona Nyaman Coffee'
  );
  const [placeAddress, setPlaceAddress] = useState(
    journal?.placeAddress || 'Kemanggisan, Jakarta Barat'
  );
  const [visitDate, setVisitDate] = useState('12 Okt 2026');
  const [visitTime, setVisitTime] = useState('10:30');

  // Title, Category, Rating
  const [title, setTitle] = useState(
    'Steak yang Juicy dan Kopi yang Selalu Enak'
  );
  const [selectedCategory, setSelectedCategory] = useState<
    'makanan' | 'minuman' | 'dessert' | 'camilan'
  >('makanan');
  const [rating, setRating] = useState(journal?.overallRating || 4.0);

  // Review story
  const [reviewText, setReviewText] = useState(
    journal?.reviewText ||
      'Tempatnya nyaman, kopi nya enak, croissantnya juga flaky banget. Steak nya juicy dan bumbunya pas. Pasti akan balik lagi!'
  );

  // Menu items
  const [menuItems, setMenuItems] = useState([
    {
      id: 'm1',
      name: 'Ribeye Steak',
      price: 'Rp 185.000',
      photo:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'm2',
      name: 'Café Latte',
      price: 'Rp 38.000',
      photo:
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'm3',
      name: 'Strawberry Pancake',
      price: 'Rp 75.000',
      photo:
        'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&auto=format&fit=crop&q=80',
    },
  ]);

  // Tags
  const [tags, setTags] = useState<string[]>([
    'Nyaman',
    'Pelayanan Baik',
    'Kopi Enak',
    'Cocok untuk Kerja',
    'Suasana Cozy',
  ]);

  // Visibility
  const [isPublic, setIsPublic] = useState(true);

  const handleDelete = () => {
    Alert.alert(
      'Hapus Jurnal',
      `Apakah Anda yakin ingin menghapus jurnal kunjungan ke ${placeName}? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (onDelete && journal) {
              onDelete(journal.id);
            } else {
              onBack();
            }
          },
        },
      ]
    );
  };

  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 1) {
      Alert.alert('Perhatian', 'Jurnal minimal memiliki 1 foto makanan.');
      return;
    }
    const next = [...photos];
    next.splice(index, 1);
    setPhotos(next);
  };

  const handleAddPhoto = () => {
    Alert.alert('Tambah Foto', 'Pilih sumber foto:', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kamera',
        onPress: async () => {
          const uri = await ImageService.takePhotoWithCamera();
          if (uri) setPhotos((prev) => [...prev, uri]);
        },
      },
      {
        text: 'Galeri Foto',
        onPress: async () => {
          const uri = await ImageService.pickImageFromGallery();
          if (uri) setPhotos((prev) => [...prev, uri]);
        },
      },
    ]);
  };

  const handleRemoveMenu = (id: string) => {
    setMenuItems(menuItems.filter((m) => m.id !== id));
  };

  const handleAddMenu = () => {
    Alert.alert('Tambah Menu', 'Masukkan nama menu dan harga:', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tambah Croissant (Rp 38.000)',
        onPress: () => {
          setMenuItems([
            ...menuItems,
            {
              id: `m-${Date.now()}`,
              name: 'Butter Croissant',
              price: 'Rp 38.000',
              photo:
                'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
            },
          ]);
        },
      },
    ]);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddTag = () => {
    Alert.alert('Tambah Tag', 'Pilih tag baru:', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'WFC Friendly',
        onPress: () => setTags([...tags, 'WFC Friendly']),
      },
      {
        text: 'Dessert Enak',
        onPress: () => setTags([...tags, 'Dessert Enak']),
      },
    ]);
  };

  const handleSave = () => {
    const updated: DiaryEntry = {
      id: journal?.id || `journal-${Date.now()}`,
      userId: journal?.userId || 'user-demo-1',
      userName: journal?.userName || 'Vincentia',
      placeId: journal?.placeId || 'zona-nyaman-coffee',
      placeName,
      placeAddress,
      mainCategory: selectedCategory === 'minuman' ? 'drinks' : 'food',
      subCategory: 'cafe',
      subCategoryLabel: selectedCategory.toUpperCase(),
      latitude: journal?.latitude || -6.195,
      longitude: journal?.longitude || 106.785,
      photoUrls: photos,
      overallRating: rating,
      criteriaRating: journal?.criteriaRating || {
        taste: 4.5,
        ambiance: 4.5,
        service: 4.0,
        price: 4.5,
      },
      menuItems: menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        price: parseInt(m.price.replace(/[^0-9]/g, ''), 10) || 35000,
      })),
      totalSpent: menuItems.reduce(
        (sum, m) => sum + (parseInt(m.price.replace(/[^0-9]/g, ''), 10) || 0),
        0
      ),
      reviewText,
      tags,
      isPublic: false,
      visitedAt: new Date().toISOString(),
      createdAt: journal?.createdAt || new Date().toISOString(),
    };

    onSave(updated);
    Alert.alert('Berhasil', 'Jurnal berhasil diperbarui!');
  };

  return (
    <View style={styles.container}>
      {/* ================= STEP 1: FOTO & INFORMASI DASAR ================= */}
      {currentStep === 1 && (
        <View style={styles.stepWrapper}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <Text style={styles.topTitle}>Edit Journal</Text>

            <TouchableOpacity onPress={handleDelete} style={styles.trashBtn} activeOpacity={0.7}>
              <Trash size={20} color="#D04A1E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Photo Gallery Grid */}
            <View style={styles.photoGridRow}>
              {/* Left Large Photo */}
              <View style={styles.largePhotoWrapper}>
                <Image
                  source={{ uri: photos[0] }}
                  style={styles.largePhoto}
                />
                <TouchableOpacity
                  style={styles.editPhotoIconBtn}
                  onPress={handleAddPhoto}
                  activeOpacity={0.8}
                >
                  <Pencil size={15} color="#4E2E21" />
                </TouchableOpacity>
              </View>

              {/* Right Column (2 small photos + Add tile) */}
              <View style={styles.rightPhotoCol}>
                {photos[1] && (
                  <View style={styles.smallPhotoWrapper}>
                    <Image source={{ uri: photos[1] }} style={styles.smallPhoto} />
                    <TouchableOpacity
                      style={styles.removePhotoBadge}
                      onPress={() => handleRemovePhoto(1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={10} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                )}

                {photos[2] && (
                  <View style={styles.smallPhotoWrapper}>
                    <Image source={{ uri: photos[2] }} style={styles.smallPhoto} />
                    <TouchableOpacity
                      style={styles.removePhotoBadge}
                      onPress={() => handleRemovePhoto(2)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={10} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Add Photo Tile */}
                <TouchableOpacity
                  style={styles.addPhotoTile}
                  onPress={handleAddPhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={18} color="#7A675B" />
                  <Text style={styles.addPhotoTileText}>Tambah Foto</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section: Informasi Dasar */}
            <Text style={styles.sectionHeader}>Informasi Dasar</Text>
            <View style={styles.venueInfoCard}>
              <TouchableOpacity
                style={styles.venuePlaceRow}
                onPress={() =>
                  Alert.alert('Ganti Tempat', 'Pilih tempat lain dari peta atau pencarian.')
                }
                activeOpacity={0.7}
              >
                <MapPin size={18} color="#4E2E21" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.venuePlaceName}>{placeName}</Text>
                  <Text style={styles.venuePlaceAddress}>{placeAddress}</Text>
                </View>
                <ChevronRight size={18} color="#B09B8E" />
              </TouchableOpacity>

              <View style={styles.venueCardDivider} />

              <View style={styles.venueDateTimeRow}>
                <View style={styles.dateTimeCol}>
                  <Calendar size={15} color="#7A675B" style={{ marginRight: 6 }} />
                  <Text style={styles.dateTimeText}>{visitDate}</Text>
                </View>

                <View style={styles.dateTimeCol}>
                  <Clock size={15} color="#7A675B" style={{ marginRight: 6 }} />
                  <Text style={styles.dateTimeText}>{visitTime}</Text>
                </View>
              </View>
            </View>

            {/* Section: Judul */}
            <Text style={styles.sectionHeader}>Judul</Text>
            <View style={styles.titleInputContainer}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Judul catatan kuliner..."
                placeholderTextColor="#A89A90"
              />
              {title.length > 0 && (
                <TouchableOpacity onPress={() => setTitle('')}>
                  <X size={16} color="#8C7A70" />
                </TouchableOpacity>
              )}
            </View>

            {/* Section: Kategori */}
            <Text style={styles.sectionHeader}>Kategori</Text>
            <View style={styles.categoriesRow}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'makanan' && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory('makanan')}
              >
                <Utensils
                  size={14}
                  color={selectedCategory === 'makanan' ? '#FFFFFF' : '#6B3F2E'}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === 'makanan' && styles.categoryChipTextActive,
                  ]}
                >
                  Makanan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'minuman' && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory('minuman')}
              >
                <Coffee
                  size={14}
                  color={selectedCategory === 'minuman' ? '#FFFFFF' : '#6B3F2E'}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === 'minuman' && styles.categoryChipTextActive,
                  ]}
                >
                  Minuman
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'dessert' && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory('dessert')}
              >
                <Cake
                  size={14}
                  color={selectedCategory === 'dessert' ? '#FFFFFF' : '#6B3F2E'}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === 'dessert' && styles.categoryChipTextActive,
                  ]}
                >
                  Dessert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'camilan' && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory('camilan')}
              >
                <Croissant
                  size={14}
                  color={selectedCategory === 'camilan' ? '#FFFFFF' : '#6B3F2E'}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === 'camilan' && styles.categoryChipTextActive,
                  ]}
                >
                  Camilan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section: Rating */}
            <Text style={styles.sectionHeader}>Rating</Text>
            <View style={styles.ratingRow}>
              <View style={styles.starPickRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  >
                    <Star
                      size={26}
                      color="#F39A28"
                      fill={i <= rating ? '#F39A28' : 'none'}
                      style={{ marginRight: 6 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingScoreText}>{rating.toFixed(1)}</Text>
            </View>

            {/* Primary Action Button: Lanjut ke Detail */}
            <TouchableOpacity
              style={styles.lanjutBtn}
              onPress={() => setCurrentStep(2)}
              activeOpacity={0.88}
            >
              <Text style={styles.lanjutBtnText}>Lanjut ke Detail</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ================= STEP 2: CERITA, MENU & TAGS ================= */}
      {currentStep === 2 && (
        <View style={styles.stepWrapper}>
          {/* Top Bar with Step Indicator */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setCurrentStep(1)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.topTitle}>Edit Journal</Text>
              <View style={styles.topStepIndicatorActive} />
            </View>

            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section: Cerita Pengalaman */}
            <Text style={styles.sectionHeader}>Cerita Pengalaman</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textAreaInput}
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={500}
                placeholder="Bagikan pengalaman rasa, suasana, dan pelayanan di tempat ini..."
                placeholderTextColor="#A89A90"
              />
              <Text style={styles.charCountText}>
                {reviewText.length}/500
              </Text>
            </View>

            {/* Section: Menu yang Dicoba */}
            <Text style={styles.sectionHeader}>Menu yang Dicoba</Text>
            <View style={styles.menuItemsList}>
              {menuItems.map((item, idx) => (
                <View key={item.id} style={styles.menuItemCard}>
                  <Text style={styles.menuIndexNumber}>{idx + 1}</Text>
                  <Image source={{ uri: item.photo }} style={styles.menuItemThumb} />

                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveMenu(item.id)}
                    style={styles.removeMenuBtn}
                  >
                    <X size={15} color="#8C7A70" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Menu Button */}
              <TouchableOpacity
                style={styles.addMenuSoftBtn}
                onPress={handleAddMenu}
                activeOpacity={0.8}
              >
                <Plus size={15} color="#4E2E21" style={{ marginRight: 4 }} />
                <Text style={styles.addMenuSoftBtnText}>Tambah Menu</Text>
              </TouchableOpacity>
            </View>

            {/* Section: Tag & Suasana */}
            <Text style={styles.sectionHeader}>Tag & Suasana</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={12} color="#6B3F2E" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addTagPill}
                onPress={handleAddTag}
                activeOpacity={0.8}
              >
                <Plus size={13} color="#4E2E21" style={{ marginRight: 4 }} />
                <Text style={styles.addTagPillText}>Tambah Tag</Text>
              </TouchableOpacity>
            </View>

            {/* Section: Atur Privasi */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyLeft}>
                <Text style={styles.privacyLabel}>Atur Privasi</Text>
              </View>

              <TouchableOpacity
                style={styles.privacyRight}
                onPress={() => setIsPublic(!isPublic)}
                activeOpacity={0.7}
              >
                {isPublic ? (
                  <Globe size={14} color="#6B3F2E" style={{ marginRight: 4 }} />
                ) : (
                  <Lock size={14} color="#6B3F2E" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.privacyValueText}>
                  {isPublic ? 'Publik' : 'Privat'}
                </Text>
                <ChevronRight size={15} color="#B09B8E" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* Bottom Actions: Simpan Draft & Perbarui Journal */}
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity
                style={styles.draftBtn}
                onPress={() => {
                  Alert.alert('Draft Disimpan', 'Perubahan jurnal berhasil disimpan ke draft lokal.');
                  onBack();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.draftBtnText}>Simpan Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.perbaruiBtn}
                onPress={handleSave}
                activeOpacity={0.88}
              >
                <Text style={styles.perbaruiBtnText}>Perbarui Journal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  stepWrapper: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    fontWeight: '800',
    color: '#4E2E21',
  },
  topStepIndicatorActive: {
    width: 38,
    height: 3,
    backgroundColor: '#D04A1E',
    borderRadius: 2,
    marginTop: 4,
  },
  trashBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* Photos Grid */
  photoGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  largePhotoWrapper: {
    flex: 1.6,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  largePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editPhotoIconBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  rightPhotoCol: {
    flex: 1,
    gap: 8,
  },
  smallPhotoWrapper: {
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  smallPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoTile: {
    height: 62,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7B9AC',
    borderStyle: 'dashed',
    backgroundColor: '#F8F1EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoTileText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B3F2E',
    marginTop: 2,
  },

  /* Section Header */
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
    marginTop: 14,
    marginBottom: 8,
  },

  /* Venue Info Card */
  venueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    padding: 12,
    ...theme.shadows.card,
  },
  venuePlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venuePlaceName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 14,
    fontWeight: '800',
    color: '#4E2E21',
  },
  venuePlaceAddress: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  venueCardDivider: {
    height: 1,
    backgroundColor: '#F0E8DE',
    marginVertical: 10,
  },
  venueDateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    color: '#4E2E21',
    fontWeight: '600',
  },

  /* Title Input */
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 12,
    height: 46,
    ...theme.shadows.card,
  },
  titleInput: {
    flex: 1,
    fontSize: 13,
    color: '#4E2E21',
    fontWeight: '600',
  },

  /* Categories */
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  categoryChipActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B3F2E',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  /* Rating */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...theme.shadows.card,
  },
  starPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
    marginLeft: 'auto',
  },

  /* Primary Button */
  lanjutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    backgroundColor: '#4E2E21',
    borderRadius: 14,
    marginTop: 20,
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  lanjutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Step 2 Styles */
  textAreaBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    padding: 12,
    ...theme.shadows.card,
  },
  textAreaInput: {
    fontSize: 13,
    color: '#4E2E21',
    lineHeight: 19,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCountText: {
    fontSize: 11,
    color: '#8C7A70',
    textAlign: 'right',
    marginTop: 4,
  },

  /* Menu Items */
  menuItemsList: {
    gap: 8,
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  menuIndexNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
    width: 20,
  },
  menuItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  menuItemPrice: {
    fontSize: 11,
    color: '#7A675B',
    marginTop: 1,
  },
  removeMenuBtn: {
    padding: 6,
  },
  addMenuSoftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8EAD9',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  addMenuSoftBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B3F2E',
  },

  /* Tags */
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8EAD9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B3F2E',
  },
  addTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7B9AC',
    borderStyle: 'dashed',
  },
  addTagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
  },

  /* Privacy Card */
  privacyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  privacyLeft: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  privacyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B3F2E',
  },

  /* Bottom Actions */
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  draftBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C7B9AC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  draftBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  perbaruiBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#4E2E21',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  perbaruiBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
