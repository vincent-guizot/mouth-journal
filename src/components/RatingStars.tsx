import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../config/theme';

interface RatingStarsProps {
  rating: number; // 1 to 5
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showScore?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 18,
  interactive = false,
  onRatingChange,
  showScore = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {stars.map((starValue) => {
          const isFilled = rating >= starValue;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;

          return (
            <TouchableOpacity
              key={starValue}
              disabled={!interactive}
              onPress={() => onRatingChange && onRatingChange(starValue)}
              activeOpacity={0.7}
              style={styles.starWrapper}
            >
              <Star
                size={size}
                color={isFilled || isHalf ? theme.colors.amber : '#D6CEC7'}
                fill={isFilled ? theme.colors.amber : isHalf ? theme.colors.amberLight : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {showScore && (
        <Text style={styles.scoreText}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    paddingHorizontal: 2,
  },
  scoreText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
