import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { theme } from '../config/theme';

interface MouthJournalLogoProps {
  variant?: 'horizontal' | 'stacked' | 'iconOnly';
  size?: number; // base size (width or height proportional)
  themeVariant?: 'default' | 'dark' | 'terracotta' | 'monochrome';
  showTagline?: boolean;
}

/**
 * 💋 Logo Resmi MouthJournal
 * Dibuat persis berdasarkan Brand Guidelines resmi (Bibir berselera & 2 tetesan rasa)
 * Dilengkapi gradasi Coffee Brown (#4E2E21), Terracotta (#D06B3F), dan Caramel (#D9A571).
 */
export const MouthJournalLogo: React.FC<MouthJournalLogoProps> = ({
  variant = 'horizontal',
  size = 40,
  themeVariant = 'default',
  showTagline = true,
}) => {
  // Ukuran proporsional SVG Icon
  const iconWidth = size * 1.5;
  const iconHeight = size;

  // Warna Wordmark sesuai tema
  const textColor =
    themeVariant === 'dark' || themeVariant === 'terracotta'
      ? '#FFFFFF'
      : theme.colors.coffeeBrown;

  const taglineColor =
    themeVariant === 'dark' || themeVariant === 'terracotta'
      ? theme.colors.cream
      : theme.colors.terracotta;

  // SVG Mark Bibir & Tetesan Rasa (Mouth & Droplets)
  const renderIconMark = () => (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 150 100" fill="none">
      <Defs>
        {/* Gradasi Bibir Atas Kiri (Coffee Brown ke Terracotta) */}
        <LinearGradient id="topLipLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4E2E21" />
          <Stop offset="100%" stopColor="#6B3F2E" />
        </LinearGradient>

        {/* Gradasi Bibir Atas Kanan (Terracotta ke Caramel) */}
        <LinearGradient id="topLipRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D06B3F" />
          <Stop offset="100%" stopColor="#D9A571" />
        </LinearGradient>

        {/* Gradasi Bibir Bawah Kiri (Espresso ke Terracotta) */}
        <LinearGradient id="bottomLipLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6B3F2E" />
          <Stop offset="100%" stopColor="#4E2E21" />
        </LinearGradient>

        {/* Gradasi Lidah / Bibir Bawah Kanan (Caramel Cerah) */}
        <LinearGradient id="tongueCurl" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D06B3F" />
          <Stop offset="70%" stopColor="#D9A571" />
          <Stop offset="100%" stopColor="#F8EAD9" />
        </LinearGradient>

        {/* Gradasi Tetesan Rasa (Droplet) */}
        <LinearGradient id="dropletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D06B3F" />
          <Stop offset="100%" stopColor="#D9A571" />
        </LinearGradient>
      </Defs>

      <G>
        {/* 1. Bibir Atas Kiri (Gelombang Halus) */}
        <Path
          d="M18 45 C35 20, 60 14, 75 35 C65 42, 45 48, 18 45 Z"
          fill="url(#topLipLeft)"
        />

        {/* 2. Bibir Atas Kanan (Puncak Kedua & Lekukan) */}
        <Path
          d="M75 35 C90 14, 115 20, 132 45 C105 48, 85 42, 75 35 Z"
          fill="url(#topLipRight)"
        />

        {/* 3. Bibir Bawah Kiri (Volume Espresso) */}
        <Path
          d="M18 45 C35 72, 60 76, 75 58 C60 52, 38 48, 18 45 Z"
          fill="url(#bottomLipLeft)"
        />

        {/* 4. Lekukan Menikmati Rasa (Tongue / Bottom Lip Swirl) */}
        <Path
          d="M75 58 C85 76, 110 74, 132 45 C115 55, 95 62, 75 58 Z"
          fill="url(#tongueCurl)"
        />

        {/* 5. Tetesan Rasa 1 (Besar - Atas Kanan) */}
        <Path
          d="M136 34 C136 29, 142 27, 145 32 C148 37, 142 42, 138 39 C136 37, 136 35, 136 34 Z"
          fill="url(#dropletGrad)"
        />

        {/* 6. Tetesan Rasa 2 (Kecil - Bawah Kanan) */}
        <Path
          d="M141 46 C141 43, 145 42, 147 45 C149 48, 145 51, 142 49 C141 48, 141 47, 141 46 Z"
          fill="url(#dropletGrad)"
        />
      </G>
    </Svg>
  );

  if (variant === 'iconOnly') {
    return <View style={styles.iconContainer}>{renderIconMark()}</View>;
  }

  if (variant === 'stacked') {
    return (
      <View style={styles.stackedContainer}>
        {renderIconMark()}
        <Text style={[styles.wordmarkTitle, { color: textColor, fontSize: size * 0.7 }]}>
          MouthJournal
        </Text>
        {showTagline && (
          <Text style={[styles.taglineText, { color: taglineColor, fontSize: size * 0.22 }]}>
            FOOD  ·  PLACES  ·  MEMORIES
          </Text>
        )}
      </View>
    );
  }

  // Variant 'horizontal' (Primary)
  return (
    <View style={styles.horizontalContainer}>
      {renderIconMark()}
      <View style={styles.textColumn}>
        <Text style={[styles.wordmarkTitle, { color: textColor, fontSize: size * 0.55 }]}>
          MouthJournal
        </Text>
        {showTagline && (
          <Text style={[styles.taglineText, { color: taglineColor, fontSize: size * 0.18 }]}>
            FOOD · PLACES · MEMORIES
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    marginLeft: 6,
    justifyContent: 'center',
  },
  stackedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkTitle: {
    fontFamily: theme.fonts.serifBold,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  taglineText: {
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
