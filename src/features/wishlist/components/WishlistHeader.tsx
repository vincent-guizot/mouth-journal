import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface WishlistHeaderProps {
  onOpenMap: () => void;
}

export const WishlistHeader: React.FC<WishlistHeaderProps> = ({ onOpenMap }) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerTitleGroup}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerSubtitle}>Tempat dan menu yang ingin kamu coba</Text>
      </View>

      <TouchableOpacity
        style={styles.mapPillButton}
        onPress={onOpenMap}
        activeOpacity={0.8}
      >
        <BookOpen size={14} color="#4E2E21" style={{ marginRight: 5 }} />
        <Text style={styles.mapPillText}>Lihat di Peta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 26,
    fontWeight: '800',
    color: '#4E2E21',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  mapPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  mapPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
  },
});
