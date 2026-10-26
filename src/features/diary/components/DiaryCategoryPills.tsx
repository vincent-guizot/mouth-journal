import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../../config/theme';
import { DIARY_CATEGORIES } from '../constants/diaryConstants';

interface DiaryCategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const DiaryCategoryPills: React.FC<DiaryCategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.chipsRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {DIARY_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chipItem, isSelected && styles.chipItemActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Icon
                size={14}
                color={isSelected ? '#FFFFFF' : theme.colors.coffeeBrown}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chipsRow: {
    marginBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E0D8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipItemActive: {
    backgroundColor: theme.colors.coffeeBrown,
    borderColor: theme.colors.coffeeBrown,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
