import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Coffee, Camera, MapPin, Star, Bookmark, Crown, ChevronRight } from 'lucide-react-native';

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
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.crownWrapper}>
            <Crown size={14} color="#D9A571" fill="#D9A571" />
          </View>
          <Text style={styles.sectionTitle}>Pencapaian</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
          <ChevronRight size={14} color="#D04A1E" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {ACHIEVEMENTS.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={item.id} style={styles.badgeCard} activeOpacity={0.8}>
              <View style={styles.badgeIconWrapper}>
                <Icon size={18} color="#6B3F2E" />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D04A1E',
    marginRight: 2,
  },
  scroll: {
    flexDirection: 'row',
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    width: 86,
  },
  badgeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3DCB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E9C994',
    transform: [{ rotate: '0deg' }],
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
    textAlign: 'center',
  },
});
