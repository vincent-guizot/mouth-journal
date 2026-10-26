import React from 'react';
import { BookOpen, Star } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { DiarySegment } from '../constants/diaryConstants';
import { IllustratedState } from '../../../components/feedback/IllustratedState';

interface DiaryEmptyViewProps {
  segment: DiarySegment;
}

export const DiaryEmptyView: React.FC<DiaryEmptyViewProps> = ({ segment }) => {
  const isFavorites = segment === 'favorites';

  return (
    <IllustratedState
      tone="neutral"
      size={88}
      icon={
        isFavorites ? (
          <Star size={30} color={theme.colors.terracotta} strokeWidth={2} />
        ) : (
          <BookOpen size={30} color={theme.colors.terracotta} strokeWidth={2} />
        )
      }
      title={isFavorites ? 'Belum Ada Favorit' : 'Belum Ada Jurnal'}
      subtitle={
        isFavorites
          ? 'Belum ada catatan kuliner yang ditandai sebagai favorit.'
          : 'Mulai catat pengalaman kuliner pertamamu!'
      }
    />
  );
};
