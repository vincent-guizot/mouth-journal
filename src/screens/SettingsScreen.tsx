import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../config/theme';
import {
  ArrowLeft,
  MapPin,
  Palette,
  Utensils,
  ChevronRight,
} from 'lucide-react-native';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onShowOnboarding?: () => void;
  onNavigateCategory?: (category: 'account' | 'location' | 'appearance' | 'preferences' | 'data') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  onShowOnboarding,
  onNavigateCategory,
}) => {
  const settingsItems = [
    {
      id: 'location',
      title: 'Izin akses lokasi',
      subtitle: 'Atur izin dan radius pencarian tempat di sekitarmu.',
      icon: MapPin,
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: 'Pilih tampilan terang, gelap, atau mengikuti perangkat.',
      icon: Palette,
    },
    {
      id: 'preferences',
      title: 'Food Preferences',
      subtitle: 'Pilih kategori kuliner yang paling kamu suka.',
      icon: Utensils,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#4E2E21" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Atur aplikasi sesuai kebutuhanmu</Text>
          </View>
        </View>

        {/* Settings Cards List */}
        <View style={styles.listContainer}>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => onNavigateCategory?.(item.id as 'location' | 'appearance' | 'preferences')}
                activeOpacity={0.88}
              >
                <View style={styles.iconSquare}>
                  <Icon size={26} color="#4E2E21" strokeWidth={2} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <ChevronRight size={18} color="#B09B8E" />
                  </View>

                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 28,
    fontWeight: '800',
    color: '#4E2E21',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A675B',
    marginTop: 2,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E8DE',
    ...theme.shadows.card,
  },
  iconSquare: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FAF1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7A675B',
    marginTop: 2,
    lineHeight: 16,
  },
});
