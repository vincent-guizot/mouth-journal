import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../../config/theme';

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
    <View style={styles.container}>
      {icon || <Sparkles size={36} color={theme.colors.terracotta} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2C1E',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A7A6D',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionWrap: {
    marginTop: 16,
  },
});
