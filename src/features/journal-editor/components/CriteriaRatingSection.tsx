import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { ExperienceRatings } from '../types';
import { CRITERIA_CRITERIA_LIST } from '../constants/categories';

interface CriteriaRatingSectionProps {
  ratings: ExperienceRatings;
  onRatingChange: (key: keyof ExperienceRatings, value: number) => void;
}

export const CriteriaRatingSection: React.FC<CriteriaRatingSectionProps> = ({
  ratings,
  onRatingChange,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>6</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionHeading}>Rating Pengalaman</Text>
          <Text style={styles.sectionSubtitle}>
            Berikan penilaian untuk pengalaman kunjungan kamu secara keseluruhan.
          </Text>
        </View>
      </View>

      <View style={styles.ratingsCard}>
        {CRITERIA_CRITERIA_LIST.map((criteria) => {
          const currentScore = ratings[criteria.key];
          return (
            <View key={criteria.key} style={styles.ratingRow}>
              <Text style={styles.criteriaLabel}>{criteria.label}</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= currentScore;
                  return (
                    <TouchableOpacity
                      key={starVal}
                      onPress={() => onRatingChange(criteria.key, starVal)}
                      style={{ paddingHorizontal: 3 }}
                    >
                      <Star
                        size={18}
                        color={isFilled ? '#F39A28' : '#DCD3C7'}
                        fill={isFilled ? '#F39A28' : 'transparent'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
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
  ratingsCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  criteriaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2C1E',
  },
  starPickerRow: {
    flexDirection: 'row',
  },
});
