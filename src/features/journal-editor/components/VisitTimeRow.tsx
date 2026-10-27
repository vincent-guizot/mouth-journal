import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { theme } from '../../../config/theme';

interface VisitTimeRowProps {
  visitDate: string;
  onPressDate?: () => void;
}

export const VisitTimeRow: React.FC<VisitTimeRowProps> = ({
  visitDate,
  onPressDate,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>4</Text>
        </View>
        <Text style={styles.sectionHeading}>Tanggal Kunjungan</Text>
      </View>

      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateTimeInput}
          activeOpacity={0.8}
          onPress={onPressDate}
        >
          <Calendar size={15} color={theme.colors.coffeeBrown} style={{ marginRight: 6 }} />
          <Text style={styles.dateTimeValue}>{visitDate}</Text>
          <ChevronDown size={15} color={theme.colors.textTertiary} />
        </TouchableOpacity>

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
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    justifyContent: 'space-between',
  },
  dateTimeValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2C1E',
  },
});
