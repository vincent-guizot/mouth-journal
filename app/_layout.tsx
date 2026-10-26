import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Caveat_600SemiBold,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { AuthProvider } from '../src/context/AuthContext';
import { theme } from '../src/config/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_600SemiBold,
    Caveat_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="journals/[journalId]"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="journals/create"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="journals/[journalId]/edit"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="places/[placeId]"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="places/search"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="wishlist/[itemId]"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="settings/index"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="recommendations/index"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="notifications/index"
            options={{ presentation: 'card' }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
