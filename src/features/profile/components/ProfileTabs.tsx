import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfileTab } from '../hooks/useProfileScreen';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  journalsCount: number;
  placesCount: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  journalsCount,
  placesCount,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'jurnal' && styles.tabButtonActive]}
        onPress={() => onTabChange('jurnal')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'jurnal' && styles.tabButtonTextActive,
          ]}
        >
          Jurnal ({journalsCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'tempat' && styles.tabButtonActive]}
        onPress={() => onTabChange('tempat')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'tempat' && styles.tabButtonTextActive,
          ]}
        >
          Tempat ({placesCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'menu' && styles.tabButtonActive]}
        onPress={() => onTabChange('menu')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'menu' && styles.tabButtonTextActive,
          ]}
        >
          Menu (36)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'wishlist' && styles.tabButtonActive]}
        onPress={() => onTabChange('wishlist')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'wishlist' && styles.tabButtonTextActive,
          ]}
        >
          Wishlist (8)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  tabButtonActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
});
