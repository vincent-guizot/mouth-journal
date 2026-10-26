import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  readOnly = false,
  onRatingChange,
  activeColor = '#F39A28',
  inactiveColor = '#DCD3C7',
}) => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const isFilled = star <= Math.floor(rating);
        const StarIcon = (
          <Star
            key={star}
            size={size}
            color={isFilled ? activeColor : inactiveColor}
            fill={isFilled ? activeColor : 'transparent'}
            style={styles.star}
          />
        );

        if (readOnly) {
          return StarIcon;
        }

        return (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange && onRatingChange(star)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            {StarIcon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
