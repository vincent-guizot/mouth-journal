import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../config/theme';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'rating' | 'beta';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  icon,
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case 'accent':
        return styles.accentBadge;
      case 'rating':
        return styles.ratingBadge;
      case 'beta':
        return styles.betaBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'accent':
        return styles.accentText;
      case 'rating':
        return styles.ratingText;
      case 'beta':
        return styles.betaText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      {icon && <>{icon}</>}
      <Text style={[styles.text, getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  defaultText: {
    color: '#6B5749',
  },
  accentBadge: {
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#F8C4AC',
  },
  accentText: {
    color: theme.colors.terracotta,
  },
  ratingBadge: {
    backgroundColor: '#FFF9EC',
    borderWidth: 1,
    borderColor: '#FDE3A7',
  },
  ratingText: {
    color: '#D48806',
  },
  betaBadge: {
    backgroundColor: '#D04A1E',
  },
  betaText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
