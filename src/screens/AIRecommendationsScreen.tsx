import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { EmptyState } from '../components/feedback/EmptyState';
import { theme } from '../config/theme';

interface AIRecommendationsScreenProps {
  onBack: () => void;
  onOpenExplore: () => void;
}

/**
 * No recommendation engine/back end exists yet. Instead of hard-coded places,
 * ratings and "AI insights", the screen states that the feature is unavailable and
 * points to Explore, which shows real OpenStreetMap places.
 */
export const AIRecommendationsScreen: React.FC<AIRecommendationsScreenProps> = ({ onBack, onOpenExplore }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Kembali">
        <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
      </TouchableOpacity>
      <Text style={styles.title}>Rekomendasi AI</Text>
      <View style={{ width: 36 }} />
    </View>
    <EmptyState
      icon={<Sparkles size={34} color={theme.colors.terracotta} />}
      title="Belum Tersedia"
      subtitle="Rekomendasi personal belum diaktifkan. Gunakan Explore untuk melihat tempat nyata di sekitarmu dari OpenStreetMap."
      action={
        <TouchableOpacity onPress={onOpenExplore} style={styles.cta}>
          <Text style={styles.ctaText}>Buka Explore</Text>
        </TouchableOpacity>
      }
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 6 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.coffeeBrown },
  cta: { marginTop: 14, backgroundColor: theme.colors.terracotta, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
