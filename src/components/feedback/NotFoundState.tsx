import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';

export interface NotFoundStateProps {
  title: string;
  message?: string;
  onBack: () => void;
  onRetry?: () => void;
}

/** Explicit not-found / invalid-param / load-error state for routes. */
export const NotFoundState: React.FC<NotFoundStateProps> = ({ title, message, onBack, onRetry }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    <View style={styles.row}>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={[styles.button, styles.secondary]}>
          <Text style={[styles.buttonText, { color: theme.colors.terracotta }]}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.coffeeBrown, textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10 },
  button: { backgroundColor: theme.colors.terracotta, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.terracotta },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
