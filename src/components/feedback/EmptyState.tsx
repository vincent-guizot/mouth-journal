import React from 'react';
import { StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../../config/theme';
import { IllustratedState } from './IllustratedState';

export interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum Ada Data',
  subtitle = 'Data yang kamu cari belum tersedia.',
  icon,
  action,
}) => {
  return (
    <IllustratedState
      tone="neutral"
      icon={icon || <Sparkles size={34} color={theme.colors.terracotta} />}
      title={title}
      subtitle={subtitle}
      action={action}
      style={styles.fillFlex}
    />
  );
};

const styles = StyleSheet.create({
  fillFlex: {
    flex: 1,
  },
});
