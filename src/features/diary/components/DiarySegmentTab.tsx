import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, Star, Calendar } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { DiarySegment } from '../constants/diaryConstants';

interface DiarySegmentTabProps {
  activeSegment: DiarySegment;
  onSegmentChange: (segment: DiarySegment) => void;
  onCalendarPress?: () => void;
}

export const DiarySegmentTab: React.FC<DiarySegmentTabProps> = ({
  activeSegment,
  onSegmentChange,
  onCalendarPress,
}) => {
  return (
    <View style={styles.topControlRow}>
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === 'timeline' && styles.segmentBtnActive,
          ]}
          onPress={() => onSegmentChange('timeline')}
          activeOpacity={0.8}
        >
          <BookOpen
            size={15}
            color={activeSegment === 'timeline' ? '#FFFFFF' : theme.colors.coffeeBrown}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'timeline' && styles.segmentTextActive,
            ]}
          >
            Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === 'favorites' && styles.segmentBtnActive,
          ]}
          onPress={() => onSegmentChange('favorites')}
          activeOpacity={0.8}
        >
          <Star
            size={15}
            color={activeSegment === 'favorites' ? '#FFFFFF' : theme.colors.coffeeBrown}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'favorites' && styles.segmentTextActive,
            ]}
          >
            Favorit
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.calendarBtn}
        activeOpacity={0.8}
        onPress={onCalendarPress}
      >
        <Calendar size={18} color={theme.colors.coffeeBrown} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0ECE6',
    borderRadius: 22,
    padding: 3,
    flex: 1,
    marginRight: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.terracotta,
    shadowColor: theme.colors.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0ECE6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E0D8',
  },
});
