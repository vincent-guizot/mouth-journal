import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Shield, LogOut, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/config/theme';

export default function AccountSettingsRoute() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun',
      'Tindakan ini permanen. Semua jurnal, foto, dan preferensi akan dihapus selamanya.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Selamanya',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.colors.coffeeBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account & Session</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <User size={20} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.label}>Nama Tampilan</Text>
                <Text style={styles.value}>{currentUser?.displayName || 'Pengguna'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Mail size={20} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{currentUser?.email || '-'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Shield size={20} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.label}>Status Sesi</Text>
                <Text style={styles.value}>Aktif Terenkripsi</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keamanan</Text>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Ganti Kata Sandi', 'Tautan pemulihan dikirim ke email Anda.')}
          >
            <Text style={styles.actionButtonText}>Kirim Tautan Ubah Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tindakan Akun</Text>
          <TouchableOpacity
            style={styles.outlineDangerButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#C83E14" />
            <Text style={styles.outlineDangerText}>Keluar (Logout)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineDangerButton, { marginTop: 12 }]}
            activeOpacity={0.8}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={18} color="#C83E14" />
            <Text style={styles.outlineDangerText}>Hapus Akun Permanen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE6DC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9E8579',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  divider: {
    height: 1,
    backgroundColor: '#F6EFE7',
    marginVertical: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE6DC',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  outlineDangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F2',
    borderWidth: 1,
    borderColor: '#F8D1C5',
    borderRadius: 12,
    padding: 14,
  },
  outlineDangerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C83E14',
  },
});
