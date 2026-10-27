import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../config/theme';
import { JOURNAL_CATEGORIES } from '../constants/categories';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
        <Text style={styles.badgeNumberText}>5</Text>
        </View>
        <Text style={styles.sectionHeading}>Kategori</Text>
      </View>

      <View style={styles.categoryChipsWrap}>
        {JOURNAL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Icon
                size={14}
                color={isSelected ? '#FFFFFF' : theme.colors.coffeeBrown}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.coffeeBrown,
    borderColor: theme.colors.coffeeBrown,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
});
