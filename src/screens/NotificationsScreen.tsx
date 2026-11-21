import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, BellOff } from 'lucide-react-native';
import { EmptyState } from '../components/feedback/EmptyState';
import { theme } from '../config/theme';

export interface NotificationsScreenProps {
  onBack: () => void;
}

/**
 * There is no notification backend (no FCM/Expo push, no notifications collection),
 * so this screen shows an honest empty state instead of fabricated likes/comments.
 */
export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Kembali">
        <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
      </TouchableOpacity>
      <Text style={styles.title}>Notifikasi</Text>
      <View style={{ width: 36 }} />
    </View>
    <EmptyState
      icon={<BellOff size={34} color={theme.colors.terracotta} />}
      title="Belum Ada Notifikasi"
      subtitle="MouthJournal adalah jurnal pribadi; notifikasi belum tersedia di versi ini."
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 6 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.coffeeBrown },
});
