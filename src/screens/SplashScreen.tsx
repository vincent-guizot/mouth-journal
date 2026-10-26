import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../config/theme';
import { SplashMasterAssets } from '../config/assets';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);

  useEffect(() => {
    // Transition after 1.8s to second graphic, then finish at 3.6s
    const switchTimer = setTimeout(() => {
      setActiveImageIndex(1);
    }, 1800);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3600);

    return () => {
      clearTimeout(switchTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => {
        if (activeImageIndex === 0) {
          setActiveImageIndex(1);
        } else {
          onFinish();
        }
      }}
    >
      {/* Top Brand Section */}
      <View style={styles.topSection}>
        {/* Monogram Vector Mark (Lips + Steam Lines) */}
        <View style={styles.logoContainer}>
          <Svg width={64} height={64} viewBox="0 0 100 100" fill="none">
            {/* Wavy Steam Lines */}
            <Path
              d="M42 6 C40 14 46 18 44 26"
              stroke="#D04A1E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Path
              d="M58 8 C60 16 54 20 56 28"
              stroke="#D04A1E"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Linear M / Smiling Mouth Outline */}
            <Path
              d="M24 38 L24 74 C24 82 30 88 38 88 L40 88 C45 88 48 83 50 78 C52 83 55 88 60 88 L62 88 C70 88 76 82 76 74 L76 38"
              stroke="#4E2E21"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner Lip Contour */}
            <Path
              d="M34 50 C42 60 47 62 50 62 C53 62 58 60 66 50"
              stroke="#4E2E21"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>MouthJournal</Text>
        <Text style={styles.brandSubtitle}>FOOD DIARY</Text>

        {/* Brand Taglines */}
        <View style={styles.taglineBox}>
          <Text style={styles.taglineMain}>Good Food</Text>
          <Text style={styles.taglineSub}>Better Memories</Text>
        </View>
      </View>

      {/* Bottom Food Hero Photo / Collage Showcase */}
      <View style={styles.bottomSection}>
        {activeImageIndex === 0 ? (
          <Image
            source={SplashMasterAssets.heroCulinary}
            style={styles.heroImage}
          />
        ) : (
          <View style={styles.collageHeroWrapper}>
            <Image
              source={SplashMasterAssets.journalCollage}
              style={styles.collageHeroImage}
            />
          </View>
        )}

        {/* Home Indicator Bar with dual-stage highlight */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicatorTrack}>
            <View
              style={[
                styles.homeIndicatorActive,
                activeImageIndex === 1 && { marginLeft: 70 },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 34,
    fontWeight: '800',
    color: '#4E2E21',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A675B',
    letterSpacing: 4.5,
    marginTop: 6,
  },
  taglineBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  taglineMain: {
    fontFamily: theme.fonts.serifMedium,
    fontSize: 17,
    fontWeight: '600',
    color: '#6B3F2E',
  },
  taglineSub: {
    fontSize: 14,
    color: '#8C7A70',
    marginTop: 2,
  },
  bottomSection: {
    width: '100%',
    height: height * 0.52,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collageHeroWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  collageHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicatorTrack: {
    width: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
  },
  homeIndicatorActive: {
    width: 70,
    height: '100%',
    backgroundColor: '#D04A1E',
    borderRadius: 3,
  },
});

