import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Database, Trash2, HelpCircle, FileText, Download } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import {
  journalRepository,
  wishlistRepository,
  menuWishlistRepository,
  userPreferencesRepository,
  userProfileRepository,
} from '../../src/repositories';
import { theme } from '../../src/config/theme';
import { buildExportArchive } from '../../src/features/settings/exportArchive';
import { feedback } from '../../src/components/feedback';

export default function DataSupportSettingsRoute() {
  const router = useRouter();
  const { currentUser, appMode } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    if (!currentUser?.uid) return;
    const uid = currentUser.uid;
    if (appMode === 'demo') {
      feedback.showAlert('Tidak Tersedia', 'Di mode demo, cache lokal adalah satu-satunya salinan data Anda dan tidak dapat dibersihkan dari sini.');
      return;
    }
    let pending = 0;
    try {
      const [j, w, m] = await Promise.all([
        journalRepository.getSyncState(uid),
        wishlistRepository.getSyncState(uid),
        menuWishlistRepository.getSyncState(uid),
      ]);
      pending = j.pending + j.failed.length + w.pending + w.failed.length + m.pending + m.failed.length;
    } catch (err) {
      feedback.showAlert('Gagal', err instanceof Error ? err.message : String(err));
      return;
    }
    feedback.showConfirm({
      title: 'Bersihkan Cache',
      message: pending > 0
        ? `PERINGATAN: ${pending} perubahan belum tersinkron ke cloud dan akan hilang permanen.`
        : 'Cache lokal perangkat ini akan dikosongkan. Data cloud tetap aman.',
      cancelText: 'Batal',
      confirmText: pending > 0 ? 'Buang & Bersihkan' : 'Bersihkan',
      destructive: true,
      onConfirm: async () => {
        setIsClearing(true);
        try {
          await Promise.all([
            journalRepository.clearUserCache(uid),
            wishlistRepository.clearUserCache(uid),
            menuWishlistRepository.clearUserCache(uid),
            userPreferencesRepository.clearUserCache(uid),
            userProfileRepository.clearUserCache(uid),
          ]);
          feedback.showToast('Cache lokal berhasil dibersihkan.', 'success');
        } catch (err) {
          feedback.showAlert('Gagal', err instanceof Error ? err.message : String(err));
        } finally {
          setIsClearing(false);
        }
      },
    });
  };

  /** Real export: the full JSON archive is handed to the OS share sheet. */
  const handleExportData = async () => {
    if (!currentUser?.uid) return;
    try {
      const [journals, wishlist, menuWishlist, settings] = await Promise.all([
        journalRepository.getJournals(currentUser.uid),
        wishlistRepository.getWishlist(currentUser.uid),
        menuWishlistRepository.getMenuWishlist(currentUser.uid),
        userPreferencesRepository.getSettings(currentUser.uid),
      ]);
      const archive = buildExportArchive(currentUser, journals, wishlist, settings, menuWishlist);
      await Share.share({ title: 'MouthJournal export', message: JSON.stringify(archive, null, 2) });
    } catch (err) {
      feedback.showAlert('Gagal Ekspor', err instanceof Error ? err.message : String(err));
    }
  };

  const showHelpFAQ = () => {
    feedback.showAlert(
      'Bantuan & FAQ',
      '1. Bagaimana cara menambah jurnal baru?\nKetuk tombol (+) di bilah navigasi bawah.\n\n2. Apakah foto makanan saya publik?\nTidak. Jurnal disimpan di akun Firebase Anda dan hanya dapat dibaca oleh akun Anda (aturan keamanan Firestore).\n\n3. Bagaimana cara kerja pencarian kafe Explore?\nPeta mendeteksi tempat sekitar melalui OpenStreetMap tanpa melacak data pribadi Anda.'
    );
  };

  const showPrivacyPolicy = () => {
    feedback.showAlert(
      'Kebijakan Privasi',
      'MouthJournal adalah aplikasi personal-first. Kami tidak pernah menjual data kuliner Anda, tidak menyertakan pelacak iklan, dan tidak mempublikasikan catatan Anda ke feed publik.'
    );
  };

  const showTerms = () => {
    feedback.showAlert(
      'Syarat & Ketentuan',
      'Seluruh konten jurnal, review rasa, dan foto yang Anda unggah adalah hak milik intelektual Anda sepenuhnya sebagai pencipta catatan.'
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
        <Text style={styles.headerTitle}>Data & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penyimpanan & Cache</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Database size={20} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.itemTitle}>Cache Offline</Text>
                <Text style={styles.itemSubtitle}>Menyimpan salinan jurnal untuk akses instan.</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.outlineButton, { marginTop: 12 }]}
              onPress={handleClearCache}
              disabled={isClearing}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color={theme.colors.coffeeBrown} />
              <Text style={styles.outlineButtonText}>
                {isClearing ? 'Membersihkan...' : 'Bersihkan Cache Lokal'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portabilitas Data</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Download size={20} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.itemTitle}>Unduh Cadangan Pribadi</Text>
                <Text style={styles.itemSubtitle}>
                  Jurnal Anda sepenuhnya milik Anda. Ekspor catatan kapan saja.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.outlineButton, { marginTop: 12 }]}
              onPress={handleExportData}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Ekspor Data JSON</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bantuan & Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.legalRow}
              onPress={showHelpFAQ}
              activeOpacity={0.7}
            >
              <HelpCircle size={18} color={theme.colors.terracotta} />
              <Text style={styles.legalText}>Pertanyaan Umum & FAQ</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.legalRow}
              onPress={showPrivacyPolicy}
              activeOpacity={0.7}
            >
              <FileText size={18} color={theme.colors.terracotta} />
              <Text style={styles.legalText}>Kebijakan Privasi</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.legalRow}
              onPress={showTerms}
              activeOpacity={0.7}
            >
              <FileText size={18} color={theme.colors.terracotta} />
              <Text style={styles.legalText}>Syarat & Ketentuan Layanan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
          <View style={styles.card}>
            <Text style={styles.aboutName}>MouthJournal v1.0.0</Text>
            <Text style={styles.aboutDesc}>
              Buku harian kuliner pribadi yang hangat, privat, dan artistik. MouthJournal dirancang khusus untuk menyimpan setiap kenangan rasa kopi dan santapan Anda tanpa fitur sosial publik.
            </Text>
          </View>
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
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#8A7569',
    marginTop: 2,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE6DC',
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  aboutName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
    marginBottom: 6,
  },
  aboutDesc: {
    fontSize: 13,
    color: '#7C675B',
    lineHeight: 18,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  legalText: {
    fontSize: 14,
    color: theme.colors.coffeeBrown,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F6EFE7',
    marginVertical: 4,
  },
});
