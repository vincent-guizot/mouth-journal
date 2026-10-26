import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CriteriaRating } from '../types/diary';
import { theme } from '../config/theme';
import { Utensils, Sparkles, UserCheck, Banknote } from 'lucide-react-native';

interface CriteriaSliderProps {
  ratings: CriteriaRating;
  onChange: (key: keyof CriteriaRating, value: number) => void;
  readOnly?: boolean;
}

export const CriteriaSlider: React.FC<CriteriaSliderProps> = ({
  ratings,
  onChange,
  readOnly = false,
}) => {
  const criteriaList: Array<{
    key: keyof CriteriaRating;
    label: string;
    icon: any;
    color: string;
  }> = [
    { key: 'taste', label: 'Rasa Makanan/Minuman', icon: Utensils, color: '#E05A47' },
    { key: 'ambiance', label: 'Suasana & Tempat', icon: Sparkles, color: '#D97706' },
    { key: 'service', label: 'Pelayanan (Service)', icon: UserCheck, color: '#2563EB' },
    { key: 'price', label: 'Kesesuaian Harga (Value)', icon: Banknote, color: '#059669' },
  ];

  return (
    <View style={styles.container}>
      {criteriaList.map((item) => {
        const Icon = item.icon;
        const currentValue = ratings[item.key] || 4;

        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.labelContainer}>
              <View style={[styles.iconBadge, { backgroundColor: item.color + '15' }]}>
                <Icon size={14} color={item.color} />
              </View>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>

            <View style={styles.scoresRow}>
              {[1, 2, 3, 4, 5].map((score) => {
                const isSelected = currentValue === score;
                return (
                  <TouchableOpacity
                    key={score}
                    disabled={readOnly}
                    onPress={() => onChange(item.key, score)}
                    style={[
                      styles.scoreBtn,
                      isSelected && { backgroundColor: item.color, borderColor: item.color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreBtnText,
                        isSelected && { color: '#FFFFFF', fontWeight: 'bold' },
                      ]}
                    >
                      {score}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  row: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreBtn: {
    flex: 1,
    height: 32,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E1D5',
    backgroundColor: '#FAF6F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
