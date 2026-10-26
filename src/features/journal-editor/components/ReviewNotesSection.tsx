import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../../config/theme';

interface ReviewNotesSectionProps {
  reviewNote: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
}

export const ReviewNotesSection: React.FC<ReviewNotesSectionProps> = ({
  reviewNote,
  onChangeText,
  maxLength = 500,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>7</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionHeading}>Catatan / Review</Text>
          <Text style={styles.sectionSubtitle}>Ceritakan pengalaman kuliner kamu.</Text>
        </View>
      </View>

      <View style={styles.reviewBox}>
        <TextInput
          style={styles.reviewInput}
          multiline
          numberOfLines={4}
          value={reviewNote}
          onChangeText={onChangeText}
          placeholder="Tulis kesan rasa dan suasana..."
          placeholderTextColor={theme.colors.textTertiary}
          textAlignVertical="top"
          maxLength={maxLength}
        />
        <Text style={styles.characterCounter}>
          {reviewNote.length}/{maxLength}
        </Text>
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
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#8A7A6D',
    marginTop: 2,
  },
  reviewBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  reviewInput: {
    fontSize: 13,
    color: '#3D2C1E',
    minHeight: 80,
    lineHeight: 18,
  },
  characterCounter: {
    fontSize: 11,
    color: '#8A7A6D',
    textAlign: 'right',
    marginTop: 4,
  },
});
