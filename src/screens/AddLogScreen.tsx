import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NearbyPlace } from '../types/places';
import { theme } from '../config/theme';
import { Check } from 'lucide-react-native';
import { useJournalForm } from '../features/journal-editor/hooks/useJournalForm';
import { PhotoUploaderSection } from '../features/journal-editor/components/PhotoUploaderSection';
import { PlacePickerCard } from '../features/journal-editor/components/PlacePickerCard';
import { VisitTimeRow } from '../features/journal-editor/components/VisitTimeRow';
import { CategorySelector } from '../features/journal-editor/components/CategorySelector';
import { MenuItemsSection } from '../features/journal-editor/components/MenuItemsSection';
import { CriteriaRatingSection } from '../features/journal-editor/components/CriteriaRatingSection';
import { ReviewNotesSection } from '../features/journal-editor/components/ReviewNotesSection';
import { PrivacyCard } from '../features/journal-editor/components/PrivacyCard';

export interface AddLogScreenProps {
  initialPlace?: NearbyPlace | null;
  userId: string;
  userName: string;
  onClose?: () => void;
  onSuccess: () => void;
}

export const AddLogScreen: React.FC<AddLogScreenProps> = ({
  initialPlace,
  userId,
  userName,
  onClose,
  onSuccess,
}) => {
  const {
    photos,
    handleAddPhoto,
    handleRemovePhoto,
    selectedPlace,
    visitDate,
    visitTime,
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
    userId,
    userName,
    onSuccess,
  });

  const handleSaveDraft = () => {
    Alert.alert('Draft Tersimpan', 'Catatan ini telah disimpan ke draft Anda.');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Write Journal</Text>
            <Text style={styles.headerSubtitle}>Bagikan pengalaman kuliner kamu</Text>
          </View>

          <TouchableOpacity
            style={styles.draftButton}
            onPress={handleSaveDraft}
            activeOpacity={0.8}
          >
            <Text style={styles.draftButtonText}>Simpan Draft</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Food Photos */}
        <PhotoUploaderSection
          photos={photos}
          onAddPhoto={handleAddPhoto}
          onRemovePhoto={handleRemovePhoto}
        />

        {/* 2. Place */}
        <PlacePickerCard
          place={selectedPlace}
          onChangePlace={() =>
            Alert.alert('Ganti Tempat', 'Pilih tempat lain untuk jurnal ini.')
          }
        />

        {/* 3. Date & Time */}
        <VisitTimeRow
          visitDate={visitDate}
          visitTime={visitTime}
        />

        {/* 4. Category */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Menu Items */}
        <MenuItemsSection
          menuItems={menuItems}
          onAddMenu={handleAddMenu}
          onRemoveMenu={handleRemoveMenu}
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
                <Text style={styles.publishButtonText}>Simpan ke Jurnal Kuliner</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  draftButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  draftButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
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
});
