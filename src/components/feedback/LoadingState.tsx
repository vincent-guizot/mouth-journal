import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Coffee } from 'lucide-react-native';
import { theme } from '../../config/theme';
import { IllustratedState } from './IllustratedState';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat...',
}) => {
  return (
    <IllustratedState
      tone="neutral"
      icon={<Coffee size={32} color={theme.colors.terracotta} strokeWidth={2.2} />}
      title=""
      subtitle={undefined}
      style={styles.fillFlex}
      action={
        <View style={styles.spinnerRow}>
          <ActivityIndicator size="small" color={theme.colors.terracotta} />
          {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  fillFlex: {
    flex: 1,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -6,
  },
  text: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
