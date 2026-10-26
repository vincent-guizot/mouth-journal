import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { theme } from '../../config/theme';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Terjadi kesalahan saat memuat data.',
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <AlertCircle size={36} color="#D04A1E" />
      <Text style={styles.title}>Oops! Ada Kendala</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
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
  },
  message: {
    fontSize: 13,
    color: '#8A7A6D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
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
