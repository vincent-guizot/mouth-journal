import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar, TabType } from '../../src/components/BottomNavBar';
import { Header } from '../../src/components/Header';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  let activeTab: TabType = 'diary';
  if (pathname.includes('/explore')) activeTab = 'explore';
  else if (pathname.includes('/wishlist')) activeTab = 'wishlist';
  else if (pathname.includes('/profile')) activeTab = 'profile';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Global Brand Header across main tabs */}
      <Header
        userAvatar={currentUser?.photoURL}
        onProfilePress={() => router.push('/(tabs)/profile')}
        onNotificationPress={() => router.push('/notifications')}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => (
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'diary') router.replace('/(tabs)/diary');
              else if (tab === 'explore') router.replace('/(tabs)/explore');
              else if (tab === 'wishlist') router.replace('/(tabs)/wishlist');
              else if (tab === 'profile') router.replace('/(tabs)/profile');
            }}
            onAddPress={() => {
              router.push('/journals/create');
            }}
          />
        )}
      >
        <Tabs.Screen name="diary" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="add" />
        <Tabs.Screen name="wishlist" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
