import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Store, Utensils } from 'lucide-react-native';
import { WishlistTab } from '../hooks/useWishlist';

interface WishlistTabsProps {
  activeTab: WishlistTab;
  onTabChange: (tab: WishlistTab) => void;
  placesCount: number;
  menuCount: number;
}

export const WishlistTabs: React.FC<WishlistTabsProps> = ({
  activeTab,
  onTabChange,
  placesCount,
  menuCount,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'tempat' && styles.tabButtonActive]}
        onPress={() => onTabChange('tempat')}
        activeOpacity={0.85}
      >
        <Store
          size={16}
          color={activeTab === 'tempat' ? '#FFFFFF' : '#4E2E21'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.tabButtonText, activeTab === 'tempat' && styles.tabButtonTextActive]}
        >
          Tempat ({placesCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'menu' && styles.tabButtonActive]}
        onPress={() => onTabChange('menu')}
        activeOpacity={0.85}
      >
        <Utensils
          size={16}
          color={activeTab === 'menu' ? '#FFFFFF' : '#4E2E21'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.tabButtonText, activeTab === 'menu' && styles.tabButtonTextActive]}
        >
          Menu ({menuCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginVertical: 8,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  tabButtonActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
});
