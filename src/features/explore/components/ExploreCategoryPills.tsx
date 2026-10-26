import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import {
  LayoutGrid,
  Coffee,
  Utensils,
  Sandwich,
  Cake,
} from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface ExploreCategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'drinks', label: 'Kopi & Minuman', icon: Coffee },
  { id: 'food', label: 'Restoran', icon: Utensils },
  { id: 'street_food', label: 'Street Food', icon: Sandwich },
  { id: 'dessert', label: 'Dessert', icon: Cake },
];

export const ExploreCategoryPills: React.FC<ExploreCategoryPillsProps> = ({
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
        {CATEGORIES.map((cat) => {
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
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}
              >
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
    paddingHorizontal: 18,
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
