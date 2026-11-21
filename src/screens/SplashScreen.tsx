import React, { useEffect, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { theme } from '../config/theme';
import { SplashMasterAssets } from '../config/assets';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);
  const { height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(18));
  const [scale] = useState(() => new Animated.Value(0.96));

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(18);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 150, useNativeDriver: true }),
    ]).start();
  }, [activeImageIndex, opacity, scale, translateY]);

  const handleContinue = () => {
    if (activeImageIndex === 0) {
      setActiveImageIndex(1);
      return;
    }
    onFinish();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
      {/* Top Brand Section */}
      <View style={styles.topSection}>
        <Image source={require('../../assets/Logo.png')} style={styles.brandLogo} resizeMode="contain" />

        {/* Brand Taglines */}
        <View style={styles.taglineBox}>
          <Text style={styles.taglineMain}>Good Food</Text>
          <Text style={styles.taglineSub}>Better Memories</Text>
        </View>
      </View>

      {/* Bottom Food Hero Photo / Collage Showcase */}
      <Animated.View style={[styles.bottomSection, { height: Math.min(height * 0.42, 340), opacity, transform: [{ translateY }]}]}>
        <Pressable style={styles.visualPressable} onPress={handleContinue}>
          <Animated.View style={[styles.visualContent, { transform: [{ scale }] }]}>
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
          </Animated.View>
        </Pressable>

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
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={[styles.dot, activeImageIndex === 0 && styles.dotActive]} />
          <View style={[styles.dot, activeImageIndex === 1 && styles.dotActive]} />
        </View>
        <Pressable
          style={styles.primaryButton}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={activeImageIndex === 0 ? 'Lanjut' : 'Mulai sekarang'}
        >
          <Text style={styles.primaryButtonText}>
            {activeImageIndex === 0 ? 'Lanjut' : 'Mulai sekarang'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.tapHint}>Ketuk gambar atau tombol untuk lanjut</Text>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFCF6' },
  container: {
    flex: 1,
    backgroundColor: '#FFFCF6',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  brandLogo: { width: 190, height: 72 },
  taglineBox: {
    alignItems: 'center',
    marginTop: 4,
  },
  taglineMain: {
    fontSize: 12,
    letterSpacing: 1.1,
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
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#EBDCCD',
    shadowColor: '#4E2E21',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  visualPressable: { flex: 1 },
  visualContent: { flex: 1 },
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
  homeIndicatorTrack: { display: 'none' },
  homeIndicatorActive: { display: 'none' },
  footer: { paddingBottom: 10 },
  pagination: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E3D5C6' },
  dotActive: { width: 26, backgroundColor: theme.colors.terracotta },
  primaryButton: { height: 54, borderRadius: 16, backgroundColor: theme.colors.coffeeBrown, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  tapHint: { textAlign: 'center', color: '#A28C7C', fontSize: 11, marginTop: 11 },
});

