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
  User,
  MapPin,
  Palette,
  Utensils,
  Database,
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
  const handleAccountPress = () => {
    Alert.alert('Account & Session', 'Pilih tindakan akun:', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar (Logout)',
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  const handleDataPress = () => {
    Alert.alert('Data & Support', 'Pilih bantuan atau kelola data:', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Lihat Welcome & Intro',
        onPress: () => {
          if (onShowOnboarding) onShowOnboarding();
        },
      },
      {
        text: 'Hapus Cache (24.5 MB)',
        onPress: () =>
          Alert.alert('Hapus Cache', 'Cache aplikasi berhasil dibersihkan.'),
      },
    ]);
  };

  const settingsItems = [
    {
      id: 'account',
      title: 'Account & Session',
      subtitle: 'Kelola akun, informasi login, dan keamanan.',
      bullets: [
        'Informasi akun',
        'Metode login',
        'Ganti password',
        'Sesi login aktif',
        'Logout',
        'Hapus akun',
      ],
      icon: User,
      onPress: handleAccountPress,
    },
    {
      id: 'location',
      title: 'Location & Maps',
      subtitle: 'Atur lokasi dan pencarian tempat makan.',
      bullets: [
        'Izin akses lokasi',
        'Radius pencarian',
        'Gunakan lokasi saat membuat jurnal',
      ],
      icon: MapPin,
      onPress: () =>
        Alert.alert('Location & Maps', 'Radius pencarian default: 3.5 km.'),
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: 'Pilih tema tampilan aplikasi.',
      bullets: ['Light', 'Dark', 'System', 'Preview tema'],
      icon: Palette,
      onPress: () =>
        Alert.alert('Appearance', 'Mode tampilan aktif: Light (Warm Cafe Aesthetic).'),
    },
    {
      id: 'preferences',
      title: 'Food Preferences',
      subtitle: 'Personalisasi pengalaman kuliner.',
      bullets: [
        'Kategori favorit',
        'Jenis makanan/minuman',
        'Filter default di Explore',
        'Preferensi rekomendasi',
      ],
      icon: Utensils,
      onPress: () =>
        Alert.alert('Food Preferences', 'Preferensi favorit: Kopi/Cafe & Restoran Nusantara.'),
    },
    {
      id: 'data',
      title: 'Data & Support',
      subtitle: 'Kelola data jurnal dan dapatkan bantuan.',
      bullets: [
        'Ekspor data',
        'Penggunaan penyimpanan',
        'Hapus cache',
        'Bantuan & FAQ',
        'Tentang aplikasi',
      ],
      icon: Database,
      onPress: handleDataPress,
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
                onPress={() => {
                  if (onNavigateCategory) {
                    onNavigateCategory(item.id as any);
                  } else {
                    item.onPress();
                  }
                }}
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

                  {/* Bullet points */}
                  <View style={styles.bulletWrapper}>
                    <Text style={styles.bulletText}>
                      {item.bullets.map((b) => `• ${b}`).join('   ')}
                    </Text>
                  </View>
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
    padding: 6,
    marginRight: 10,
    marginLeft: -4,
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
  bulletWrapper: {
    marginTop: 6,
  },
  bulletText: {
    fontSize: 11,
    color: '#8C7A70',
    lineHeight: 16,
  },
});
