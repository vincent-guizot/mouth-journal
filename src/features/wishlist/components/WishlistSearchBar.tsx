import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Search, ArrowUpDown, ChevronDown } from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface WishlistSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress?: () => void;
  onSortPress?: () => void;
}

export const WishlistSearchBar: React.FC<WishlistSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSortPress,
}) => {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <Search size={16} color={theme.colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari tempat dalam wishlist..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      <TouchableOpacity
        style={styles.sortButton}
        activeOpacity={0.8}
        onPress={onSortPress}
      >
        <ArrowUpDown size={14} color="#4E2E21" style={{ marginRight: 4 }} />
        <Text style={styles.sortButtonText}>Urutkan</Text>
        <ChevronDown size={14} color="#4E2E21" style={{ marginLeft: 3 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.coffeeBrown,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
  },
});
