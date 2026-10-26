import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Coffee, Camera, MapPin, Star, Bookmark } from 'lucide-react-native';

const ACHIEVEMENTS = [
  { id: 'coffee', title: 'Coffee Lover', count: '10 tempat', icon: Coffee },
  { id: 'foodie', title: 'Foodie', count: '50 foto', icon: Camera },
  { id: 'explorer', title: 'Explorer', count: '10 kota', icon: MapPin },
  { id: 'reviewer', title: 'Top Reviewer', count: '25 review', icon: Star },
  { id: 'wishlist', title: 'Wishlist Pro', count: '30 tempat', icon: Bookmark },
];

export const ProfileBadgesSection: React.FC = () => {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>Lencana & Pencapaian</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {ACHIEVEMENTS.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={item.id} style={styles.badgeCard} activeOpacity={0.8}>
              <View style={styles.badgeIconWrapper}>
                <Icon size={16} color="#D04A1E" />
              </View>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              <Text style={styles.badgeCount}>{item.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2C1E',
    marginBottom: 8,
  },
  scroll: {
    flexDirection: 'row',
  },
  badgeCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    width: 90,
  },
  badgeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  badgeTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3D2C1E',
    textAlign: 'center',
  },
  badgeCount: {
    fontSize: 9,
    color: '#8A7A6D',
    marginTop: 2,
  },
});
