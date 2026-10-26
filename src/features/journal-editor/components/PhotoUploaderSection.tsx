import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface PhotoUploaderSectionProps {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
}

export const PhotoUploaderSection: React.FC<PhotoUploaderSectionProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>1</Text>
        </View>
        <Text style={styles.sectionHeading}>Foto Makanan</Text>
        <Text style={styles.helperRightLabel}>{photos.length} foto ditambahkan</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
        {photos.map((uri, idx) => (
          <View key={idx} style={styles.photoCard}>
            <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
            <TouchableOpacity
              style={styles.photoRemoveBtn}
              onPress={() => onRemovePhoto(idx)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <X size={11} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Tile Tambah Foto */}
        <TouchableOpacity style={styles.addPhotoTile} onPress={onAddPhoto} activeOpacity={0.8}>
          <Plus size={22} color={theme.colors.coffeeBrown} strokeWidth={2.2} />
          <Text style={styles.addPhotoLabel}>Tambah Foto</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D04A1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
  },
  helperRightLabel: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  galleryScroll: {
    flexDirection: 'row',
  },
  photoCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    marginRight: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoTile: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderStyle: 'dashed',
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoLabel: {
    fontSize: 11,
    color: theme.colors.coffeeBrown,
    fontWeight: '600',
    marginTop: 4,
  },
});
