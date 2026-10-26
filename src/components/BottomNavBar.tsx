import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BookOpen, MapPin, Bookmark, User, Plus } from 'lucide-react-native';
import { theme } from '../config/theme';

export type TabType = 'diary' | 'explore' | 'wishlist' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddPress: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onAddPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Tab 1: Diary */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabChange('diary')}
        activeOpacity={0.7}
      >
        <BookOpen
          size={22}
          color={activeTab === 'diary' ? theme.colors.coffeeBrown : '#9E8579'}
          strokeWidth={activeTab === 'diary' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'diary' && styles.tabLabelActive,
          ]}
        >
          Diary
        </Text>
        {activeTab === 'diary' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* Tab 2: Explore */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabChange('explore')}
        activeOpacity={0.7}
      >
        <MapPin
          size={22}
          color={activeTab === 'explore' ? theme.colors.coffeeBrown : '#9E8579'}
          strokeWidth={activeTab === 'explore' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'explore' && styles.tabLabelActive,
          ]}
        >
          Explore
        </Text>
        {activeTab === 'explore' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* Center (+) Add Button */}
      <View style={styles.centerAddWrapper}>
        <TouchableOpacity
          style={styles.centerAddButton}
          onPress={onAddPress}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
        </TouchableOpacity>
        <Text style={styles.addLabel}>Add</Text>
      </View>

      {/* Tab 3: Wishlist */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabChange('wishlist')}
        activeOpacity={0.7}
      >
        <Bookmark
          size={22}
          color={activeTab === 'wishlist' ? theme.colors.coffeeBrown : '#9E8579'}
          strokeWidth={activeTab === 'wishlist' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'wishlist' && styles.tabLabelActive,
          ]}
        >
          Wishlist
        </Text>
        {activeTab === 'wishlist' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      {/* Tab 4: Profile */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabChange('profile')}
        activeOpacity={0.7}
      >
        <User
          size={22}
          color={activeTab === 'profile' ? theme.colors.coffeeBrown : '#9E8579'}
          strokeWidth={activeTab === 'profile' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          Profile
        </Text>
        {activeTab === 'profile' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EAE1',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E8579',
    marginTop: 3,
  },
  tabLabelActive: {
    color: theme.colors.coffeeBrown,
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.coffeeBrown,
  },
  centerAddWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    marginTop: -16,
  },
  centerAddButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.floating,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    marginTop: 2,
  },
});
