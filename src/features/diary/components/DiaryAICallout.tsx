import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { IllustrationAssets } from '../../../config/assets';

interface DiaryAICalloutProps {
  onPress?: () => void;
}

export const DiaryAICallout: React.FC<DiaryAICalloutProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.aiBannerCard}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.aiBannerMascotWrapper}>
        <Image
          source={IllustrationAssets.aiChefRobot}
          style={styles.aiBannerMascot}
          resizeMode="contain"
        />
      </View>
      <View style={styles.aiBannerContent}>
        <View style={styles.aiBannerHeaderRow}>
          <Sparkles size={13} color="#D04A1E" />
          <Text style={styles.aiBannerTitle}>Rekomendasi untuk Kamu</Text>
          <View style={styles.aiBetaTag}>
            <Text style={styles.aiBetaTagText}>AI</Text>
          </View>
        </View>
        <Text style={styles.aiBannerSubtitle} numberOfLines={1}>
          Berdasarkan jurnal, preferensi, dan tempat favoritmu.
        </Text>
      </View>
      <ChevronRight size={17} color="#D04A1E" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  aiBannerCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFF4EE',
    borderWidth: 1.5,
    borderColor: '#FBD3C1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBannerMascotWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F8C4AC',
  },
  aiBannerMascot: {
    width: 32,
    height: 32,
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  aiBetaTag: {
    backgroundColor: '#D04A1E',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiBetaTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBannerSubtitle: {
    fontSize: 11,
    color: '#7D6B5D',
  },
});
