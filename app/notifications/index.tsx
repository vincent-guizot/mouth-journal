import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationsScreen } from '../../src/screens/NotificationsScreen';
import { theme } from '../../src/config/theme';

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NotificationsScreen
        onBack={() => router.back()}
        onOpenJournal={(journalId) => {
          router.push({
            pathname: '/journals/[journalId]',
            params: { journalId },
          });
        }}
        onOpenPlace={(placeId) => {
          router.push({
            pathname: '/places/[placeId]',
            params: { placeId },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
