import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MAP_PIN_THEME, getPinStyleForCategory } from '../../config/mapPinTheme';

interface MapPinBadgeProps {
  category: 'food' | 'drinks' | 'wisata' | string;
  subCategoryLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MapPinBadge: React.FC<MapPinBadgeProps> = ({
  category,
  subCategoryLabel,
  size = 'md',
  showLabel = true,
}) => {
  const pinStyle = getPinStyleForCategory(category);

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const badgeHeight = isSmall ? 22 : isLarge ? 32 : 26;
  const emojiSize = isSmall ? 10 : isLarge ? 14 : 12;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badgeBody,
          {
            backgroundColor: pinStyle.background,
            height: badgeHeight,
            paddingHorizontal: isSmall ? 6 : 8,
          },
        ]}
      >
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{pinStyle.emoji}</Text>
        {showLabel && (
          <Text style={[styles.labelText, isSmall && styles.labelSmall]}>
            {subCategoryLabel || pinStyle.label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  emoji: {
    marginRight: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  labelSmall: {
    fontSize: 9,
  },
});
