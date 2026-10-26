import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { DiarySegment } from '../constants/diaryConstants';

interface DiaryEmptyViewProps {
  segment: DiarySegment;
}

export const DiaryEmptyView: React.FC<DiaryEmptyViewProps> = ({ segment }) => {
  return (
    <View style={styles.emptyContainer}>
      <Sparkles size={32} color={theme.colors.terracotta} />
      <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
      <Text style={styles.emptySubtitle}>
        {segment === 'favorites'
          ? 'Belum ada catatan kuliner yang ditandai sebagai favorit.'
          : 'Mulai dokumentasikan kuliner atau tempat favorit Anda!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
