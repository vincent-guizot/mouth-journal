import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { NearbyPlace } from '../types/places';
import { Journal } from '../models/journal';
import { theme } from '../config/theme';
import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import { useJournalForm } from '../features/journal-editor/hooks/useJournalForm';
import { PhotoUploaderSection } from '../features/journal-editor/components/PhotoUploaderSection';
import { PlacePickerCard } from '../features/journal-editor/components/PlacePickerCard';
import { VisitTimeRow } from '../features/journal-editor/components/VisitTimeRow';
import { CategorySelector } from '../features/journal-editor/components/CategorySelector';
import { MenuItemsSection } from '../features/journal-editor/components/MenuItemsSection';
import { CriteriaRatingSection } from '../features/journal-editor/components/CriteriaRatingSection';
import { ReviewNotesSection } from '../features/journal-editor/components/ReviewNotesSection';
import { PrivacyCard } from '../features/journal-editor/components/PrivacyCard';
import { ScreenEntrance } from '../components/ScreenEntrance';
import { DecorativeAssets } from '../config/assets';
import { ImageService } from '../services/firebase/imageService';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface AddLogScreenProps {
  initialPlace?: NearbyPlace | null;
  initialJournal?: Journal | null;
  userId: string;
  userName: string;
  onClose?: () => void;
  onSuccess: () => void;
  onDelete?: () => Promise<void>;
}

export const AddLogScreen: React.FC<AddLogScreenProps> = ({
  initialPlace,
  initialJournal,
  userId,
  userName,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [placeNameInput, setPlaceNameInput] = useState('');
  const [placeAddressInput, setPlaceAddressInput] = useState('');
  const [foodPhotoUri, setFoodPhotoUri] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const {
    photos,
    addPhotoUri,
    handleRemovePhoto,
    selectedPlace,
    setSelectedPlace,
    visitDate,
    visitedAt,
    setVisitedAt,
    selectedCategory,
    setSelectedCategory,
    menuItems,
    handleAddMenu,
    handleRemoveMenu,
    experienceRatings,
    setCriteriaRating,
    reviewNote,
    setReviewNote,
    isSubmitting,
    handlePublish,
  } = useJournalForm({
    initialPlace,
    initialJournal,
    userId,
    userName,
    onSuccess,
  });

  const isEditing = Boolean(initialJournal?.id);

  const openPlaceEditor = () => {
    setPlaceNameInput(selectedPlace.name);
    setPlaceAddressInput(selectedPlace.address || '');
    setPlaceModalVisible(true);
  };

  const savePlace = () => {
    const name = placeNameInput.trim();
    if (!name) {
      Alert.alert('Nama tempat diperlukan', 'Masukkan nama tempat sebelum melanjutkan.');
      return;
    }
    setSelectedPlace({
      ...selectedPlace,
      name,
      address: placeAddressInput.trim() || 'Kawasan Sekitar',
    });
    setPlaceModalVisible(false);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('Hapus Jurnal', 'Jurnal ini akan dihapus secara permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete();
          } catch (error: any) {
            Alert.alert('Gagal menghapus jurnal', error?.message || 'Coba lagi sebentar.');
          }
        },
      },
    ]);
  };

  const chooseFoodPhoto = async () => {
    const uri = await ImageService.pickImageFromGallery();
    if (uri) setFoodPhotoUri(uri);
  };

  const saveFood = () => {
    const name = foodName.trim();
    const price = Number(foodPrice.replace(/[^0-9]/g, ''));
    if (!foodPhotoUri || !name || !price) {
      Alert.alert('Lengkapi menu', 'Pilih satu foto, masukkan nama makanan dan harganya.');
      return;
    }
    addPhotoUri(foodPhotoUri);
    handleAddMenu(name, price, 5, foodPhotoUri);
    setFoodPhotoUri(null);
    setFoodName('');
    setFoodPrice('');
    setFoodModalVisible(false);
  };

  return (
    <ScreenEntrance style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            accessibilityLabel="Kembali"
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <ArrowLeft size={20} color={theme.colors.coffeeBrown} />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Journal' : 'Write Journal'}</Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Perbarui pengalaman kuliner kamu' : 'Bagikan pengalaman kuliner kamu'}
            </Text>
          </View>
          {isEditing && onDelete ? (
            <TouchableOpacity accessibilityLabel="Hapus jurnal" style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={19} color={theme.colors.error} />
            </TouchableOpacity>
          ) : (
            <Image source={DecorativeAssets.celebrationSparkles4Point} style={styles.headerAsset} />
          )}
        </View>

        {/* 1. Food Photos */}
        <PhotoUploaderSection
          photos={photos}
          onAddPhoto={() => setFoodModalVisible(true)}
          onRemovePhoto={handleRemovePhoto}
        />

        {/* 2. Menus entered together with a food photo */}
        <MenuItemsSection
          menuItems={menuItems}
          onAddMenu={handleAddMenu}
          onRemoveMenu={handleRemoveMenu}
          hideAddButton
        />

        {/* 3. Place */}
        <PlacePickerCard
          place={selectedPlace}
          onChangePlace={openPlaceEditor}
        />

        {/* 4. Date */}
        <VisitTimeRow
          visitDate={visitDate}
          onPressDate={() => setDatePickerVisible(true)}
        />

        {/* 5. Category */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 6. Ratings */}
        <CriteriaRatingSection
          ratings={experienceRatings}
          onRatingChange={setCriteriaRating}
        />

        {/* 7. Review Notes */}
        <ReviewNotesSection
          reviewNote={reviewNote}
          onChangeText={setReviewNote}
        />

        {/* 8. Privacy */}
        <PrivacyCard />

        {/* Publish Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.publishButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handlePublish}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Check size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.publishButtonText}>
                  {isEditing ? 'Simpan Perubahan' : 'Simpan ke Jurnal Kuliner'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {datePickerVisible && (
        <DateTimePicker
          value={visitedAt}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setDatePickerVisible(false);
            if (date) setVisitedAt(date);
          }}
        />
      )}
      <Modal visible={foodModalVisible} transparent animationType="fade" onRequestClose={() => setFoodModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah makanan</Text>
            <TouchableOpacity style={styles.photoPicker} onPress={chooseFoodPhoto}>
              {foodPhotoUri ? <Image source={{ uri: foodPhotoUri }} style={styles.foodPreview} /> : <Text style={styles.photoPickerText}>Pilih satu foto makanan</Text>}
            </TouchableOpacity>
            <TextInput style={styles.modalInput} value={foodName} onChangeText={setFoodName} placeholder="Nama makanan atau minuman" placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={styles.modalInput} value={foodPrice} onChangeText={setFoodPrice} placeholder="Harga, contoh: 35000" keyboardType="numeric" placeholderTextColor={theme.colors.textTertiary} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setFoodModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveFood} style={styles.modalSave}><Text style={styles.modalSaveText}>Tambah</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={placeModalVisible} transparent animationType="fade" onRequestClose={() => setPlaceModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tempat yang dikunjungi</Text>
            <TextInput
              style={styles.modalInput}
              value={placeNameInput}
              onChangeText={setPlaceNameInput}
              placeholder="Nama tempat"
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={placeAddressInput}
              onChangeText={setPlaceAddressInput}
              placeholder="Alamat atau kawasan"
              placeholderTextColor={theme.colors.textTertiary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPlaceModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={savePlace} style={styles.modalSave}>
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenEntrance>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 24,
    fontWeight: '800',
    color: '#3D2C1E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
  deleteButton: { padding: 9 },
  headerAsset: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  publishButton: {
    backgroundColor: theme.colors.terracotta,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(61,44,30,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: theme.fonts.serifBold, color: theme.colors.coffeeBrown, marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  modalCancel: { paddingHorizontal: 14, paddingVertical: 10 },
  modalCancelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  modalSave: { backgroundColor: theme.colors.terracotta, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  modalSaveText: { color: '#FFFFFF', fontWeight: '800' },
  photoPicker: { height: 130, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden', backgroundColor: theme.colors.background },
  photoPickerText: { color: theme.colors.textSecondary, fontWeight: '700' },
  foodPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
});
