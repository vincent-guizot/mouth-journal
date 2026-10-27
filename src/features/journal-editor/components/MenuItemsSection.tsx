import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Plus, X, Star } from 'lucide-react-native';
import { MenuItemRow } from '../types';
import { theme } from '../../../config/theme';

interface MenuItemsSectionProps {
  menuItems: MenuItemRow[];
  onAddMenu: (name: string, price: number, rating: number) => void;
  onRemoveMenu: (id: string) => void;
  hideAddButton?: boolean;
}

export const MenuItemsSection: React.FC<MenuItemsSectionProps> = ({
  menuItems,
  onAddMenu,
  onRemoveMenu,
  hideAddButton = false,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);

  const handleSaveModal = () => {
    if (!newName.trim()) return;
    const priceNum = parseInt(newPrice.replace(/[^0-9]/g, ''), 10) || 0;
    onAddMenu(newName.trim(), priceNum, newRating);
    setNewName('');
    setNewPrice('');
    setNewRating(5);
    setModalVisible(false);
  };

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
        <Text style={styles.badgeNumberText}>2</Text>
        </View>
        <Text style={styles.sectionHeading}>Menu yang Dicoba</Text>
      </View>

      {menuItems.map((item) => (
        <View key={item.id} style={styles.menuItemCard}>
          <Image source={{ uri: item.image }} style={styles.menuThumbnail} />
          <View style={styles.menuInfoCol}>
            <View style={styles.menuTitleRow}>
              <Text style={styles.menuNameText}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => onRemoveMenu(item.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={15} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuSubRow}>
              <Text style={styles.menuPriceText}>
                Rp {item.price.toLocaleString('id-ID')}
              </Text>
              <View style={styles.menuStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    color={s <= item.rating ? '#F39A28' : '#E8E1D5'}
                    fill={s <= item.rating ? '#F39A28' : 'transparent'}
                    style={{ marginLeft: 1 }}
                  />
                ))}
                <Text style={styles.menuScoreText}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      {/* Button + Tambah Menu */}
      {!hideAddButton && (
        <TouchableOpacity
          style={styles.addMenuButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={theme.colors.coffeeBrown} style={{ marginRight: 6 }} />
          <Text style={styles.addMenuButtonText}>
            {menuItems.length === 0 ? '+ Tambah Menu yang Dipesan' : '+ Tambah Menu Lain'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal Dialog for adding item */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Menu</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nama Menu (cth: Flat White)"
              placeholderTextColor={theme.colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Harga (cth: 35000)"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <View style={styles.ratingPickerRow}>
              <Text style={styles.ratingPickerLabel}>Rating:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewRating(star)}
                  style={{ padding: 4 }}
                >
                  <Star
                    size={20}
                    color={star <= newRating ? '#F39A28' : '#DCD3C7'}
                    fill={star <= newRating ? '#F39A28' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveModal}
              >
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    marginBottom: 10,
  },
  menuThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
  },
  menuInfoCol: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  menuSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  menuPriceText: {
    fontSize: 12,
    color: '#8A7A6D',
  },
  menuStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
    marginLeft: 4,
  },
  addMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
  },
  addMenuButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    marginBottom: 12,
    fontSize: 14,
    color: '#3D2C1E',
  },
  ratingPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingPickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2C1E',
    marginRight: 8,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#8A7A6D',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: theme.colors.terracotta,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
