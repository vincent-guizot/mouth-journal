import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Plus, Utensils, Store } from 'lucide-react-native';
import { MenuWishlistCategory, MenuWishlistAddInput } from '../../../models/menuWishlist';
import { WishlistItem } from '../../../models/wishlist';
import { generateId } from '../../../utils/ids';
import { feedback } from '../../../components/feedback';

interface AddMenuWishlistModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: MenuWishlistAddInput) => Promise<void>;
  placesList?: WishlistItem[];
}

const CATEGORIES: { key: MenuWishlistCategory; label: string }[] = [
  { key: 'food', label: 'Makanan' },
  { key: 'drink', label: 'Minuman' },
  { key: 'dessert', label: 'Penutup' },
  { key: 'snack', label: 'Camilan' },
];

export const AddMenuWishlistModal: React.FC<AddMenuWishlistModalProps> = ({
  visible,
  onClose,
  onAdd,
  placesList = [],
}) => {
  const [menuName, setMenuName] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [category, setCategory] = useState<MenuWishlistCategory | undefined>(undefined);
  const [priceString, setPriceString] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setMenuName('');
    setPlaceName('');
    setPlaceId('');
    setCategory(undefined);
    setPriceString('');
    setNotes('');
    setSubmitting(false);
  };

  const handleSelectPlace = (place: WishlistItem) => {
    setPlaceName(place.placeName);
    setPlaceId(place.placeId);
  };

  const handleSubmit = async () => {
    const trimmedMenu = menuName.trim();
    const trimmedPlace = placeName.trim();

    if (!trimmedMenu) {
      feedback.showAlert('Validasi', 'Nama menu wajib diisi.');
      return;
    }
    if (!trimmedPlace) {
      feedback.showAlert('Validasi', 'Nama tempat wajib diisi.');
      return;
    }

    let parsedPrice: number | undefined;
    if (priceString.trim()) {
      const cleanNum = Number(priceString.replace(/[^0-9]/g, ''));
      if (Number.isNaN(cleanNum) || cleanNum < 0) {
        feedback.showAlert('Validasi', 'Estimasi harga harus berupa angka positif.');
        return;
      }
      parsedPrice = cleanNum;
    }

    const finalPlaceId = placeId.trim() || `manual-${generateId(12)}`;

    setSubmitting(true);
    try {
      await onAdd({
        placeId: finalPlaceId,
        placeName: trimmedPlace,
        menuName: trimmedMenu,
        category,
        estimatedPrice: parsedPrice,
        notes: notes.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      feedback.showAlert('Gagal Menyimpan', err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Utensils size={20} color="#D04A1E" />
              <Text style={styles.headerTitle}>Tambah Wishlist Menu</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#6E5A4E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nama Menu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Pain au Chocolat, Es Kopi Susu"
              placeholderTextColor="#A8988C"
              value={menuName}
              onChangeText={setMenuName}
              maxLength={120}
            />

            <Text style={styles.label}>Nama Tempat / Kedai *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Toko Kopi Tuku, Union"
              placeholderTextColor="#A8988C"
              value={placeName}
              onChangeText={(text) => {
                setPlaceName(text);
                setPlaceId('');
              }}
              maxLength={200}
            />

            {placesList.length > 0 && (
              <View style={styles.placePillsSection}>
                <Text style={styles.subLabel}>Pilih dari Wishlist Tempat:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                  {placesList.slice(0, 8).map((p) => {
                    const isSelected = placeId === p.placeId;
                    return (
                      <TouchableOpacity
                        key={p.placeId}
                        style={[styles.placePill, isSelected && styles.placePillActive]}
                        onPress={() => handleSelectPlace(p)}
                      >
                        <Store size={12} color={isSelected ? '#FFFFFF' : '#8A7A6D'} />
                        <Text
                          style={[styles.placePillText, isSelected && styles.placePillTextActive]}
                          numberOfLines={1}
                        >
                          {p.placeName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.categoryBtn, active && styles.categoryBtnActive]}
                    onPress={() => setCategory(active ? undefined : c.key)}
                  >
                    <Text style={[styles.categoryBtnText, active && styles.categoryBtnTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Estimasi Harga (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 35000"
              placeholderTextColor="#A8988C"
              keyboardType="number-pad"
              value={priceString}
              onChangeText={setPriceString}
            />

            <Text style={styles.label}>Catatan Tambahan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Contoh: Kata teman wajib pesan varian almond hangat"
              placeholderTextColor="#A8988C"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>{submitting ? 'Menyimpan...' : 'Simpan Menu'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBE3',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C4434',
    marginBottom: 6,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 11,
    color: '#8A7A6D',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3D2C1E',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  placePillsSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  placePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5ECE1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E8DCCF',
  },
  placePillActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  placePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C4434',
    maxWidth: 120,
  },
  placePillTextActive: {
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  categoryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryBtnActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  categoryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C4434',
  },
  categoryBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2EBE3',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D6C5',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E5A4E',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#D04A1E',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
