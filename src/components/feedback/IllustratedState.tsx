import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { DecorativeAssets } from '../../config/assets';
import { theme } from '../../config/theme';

export type IllustratedStateTone = 'neutral' | 'warning' | 'success';

interface IllustratedStateProps {
  icon: React.ReactNode;
  title?: string;
  subtitle?: string;
  tone?: IllustratedStateTone;
  action?: React.ReactNode;
  size?: number;
  style?: ViewStyle;
}

/**
 * Bingkai ilustrasi bulat warm (blob + ray accent) di belakang ikon,
 * dipakai di semua state kosong/sukses/error agar konsisten dengan
 * gaya "sticker sheet" (loading, empty, error, success, dll).
 */
export const IllustratedState: React.FC<IllustratedStateProps> = ({
  icon,
  title,
  subtitle,
  tone = 'neutral',
  action,
  size = 96,
  style,
}) => {
  const blobSource =
    tone === 'success'
      ? DecorativeAssets.blobBadgeRays
      : tone === 'warning'
      ? DecorativeAssets.blobBadgeRays
      : DecorativeAssets.blobSolidCircle;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.illustrationWrap, { width: size, height: size }]}>
        <Image
          source={blobSource}
          style={styles.blobImage}
          resizeMode="contain"
        />
        <View style={styles.iconCenter}>{icon}</View>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? <View style={styles.actionWrap}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  blobImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  actionWrap: {
    marginTop: 16,
  },
});
