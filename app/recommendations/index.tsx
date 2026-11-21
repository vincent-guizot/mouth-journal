import React from 'react';
import { useRouter } from 'expo-router';
import { AIRecommendationsScreen } from '../../src/screens/AIRecommendationsScreen';

export default function RecommendationsRoute() {
  const router = useRouter();
  return <AIRecommendationsScreen onBack={() => router.back()} onOpenExplore={() => router.replace('/(tabs)/explore')} />;
}
