import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface ExploreSearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress?: () => void;
}

export const ExploreSearchBar: React.FC<ExploreSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <Search size={16} color={theme.colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kafe, kuliner, spot foto terdekat..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 8,
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
});
