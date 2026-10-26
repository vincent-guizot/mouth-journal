import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { theme } from '../../config/theme';
import { IllustratedState } from './IllustratedState';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Terjadi kesalahan saat memuat data.',
  onRetry,
}) => {
  return (
    <IllustratedState
      tone="warning"
      icon={<AlertCircle size={34} color="#D04A1E" />}
      title="Oops! Ada Kendala"
      subtitle={message}
      style={styles.fillFlex}
      action={
        onRetry ? (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  fillFlex: {
    flex: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.terracotta,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
