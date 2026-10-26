import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { theme } from '../../../config/theme';

export const PrivacyCard: React.FC = () => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>8</Text>
        </View>
        <Text style={styles.sectionHeading}>Privasi Jurnal</Text>
      </View>

      <View style={styles.visibilityCard}>
        <View style={styles.visIconWrapper}>
          <Lock size={18} color={theme.colors.terracotta} />
        </View>
        <View style={styles.visInfo}>
          <Text style={styles.visTitle}>Jurnal Pribadi (Owner Only)</Text>
          <Text style={styles.visSubtitle}>
            Tersimpan secara privat & aman dalam buku harian kuliner Anda.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D04A1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
  },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  visIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  visInfo: {
    flex: 1,
  },
  visTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  visSubtitle: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 2,
  },
});
