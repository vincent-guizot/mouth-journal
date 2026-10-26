import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Coffee, Utensils, Cake, Wine } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { userPreferencesRepository } from '../../src/repositories';
import { theme } from '../../src/config/theme';

const AVAILABLE_CATEGORIES = [
  'Specialty Coffee',
  'Pastry & Croissant',
  'Artisan Bakery',
  'Nusantara Heritage',
  'Japanese & Asian Fusion',
  'Western & Brunch',
  'Dessert & Gelato',
  'Tea House & Mocktails',
];

export default function FoodPreferencesSettingsRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Specialty Coffee',
    'Pastry & Croissant',
  ]);

  useEffect(() => {
    if (currentUser?.uid) {
      (userPreferencesRepository as any)
        .getPreferences(currentUser.uid)
        .then((pref: any) => {
          if (pref.favoriteCategories && pref.favoriteCategories.length > 0) {
            setSelectedCategories(pref.favoriteCategories);
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.uid]);

  const toggleCategory = async (cat: string) => {
    let next: string[];
    if (selectedCategories.includes(cat)) {
      next = selectedCategories.filter((c) => c !== cat);
    } else {
      next = [...selectedCategories, cat];
    }
    setSelectedCategories(next);

    if (currentUser?.uid) {
      await (userPreferencesRepository as any).updatePreferences(currentUser.uid, {
        favoriteCategories: next,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Preferences</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Kategori Favorit</Text>
        <Text style={styles.sectionDesc}>
          Pilih kategori yang paling sesuai dengan selera kuliner Anda untuk kurasi rekomendasi yang lebih akurat.
        </Text>

        <View style={styles.tagGrid}>
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.8}
              >
                {isSelected && <Check size={15} color="#FFFFFF" strokeWidth={3} />}
                <Text
                  style={[styles.tagText, isSelected && styles.tagTextSelected]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#7C675B',
    marginBottom: 16,
    lineHeight: 18,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE6DC',
  },
  tagChipSelected: {
    backgroundColor: theme.colors.terracotta,
    borderColor: theme.colors.terracotta,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C675B',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
});
