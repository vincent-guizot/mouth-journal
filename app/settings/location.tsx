import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Compass } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { userPreferencesRepository } from '../../src/repositories';
import { theme } from '../../src/config/theme';

const RADIUS_OPTIONS = [1, 3, 5, 10]; // Strictly kilometers

export default function LocationSettingsRoute() {
  const router = useRouter();
  const { currentUser, userLocation } = useAuth();
  const [searchRadiusKm, setSearchRadiusKm] = useState(3.5);
  const [autoAttachLocation, setAutoAttachLocation] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      (userPreferencesRepository as any)
        .getPreferences(currentUser.uid)
        .then((pref: any) => {
          if (pref.searchRadiusKm) setSearchRadiusKm(pref.searchRadiusKm);
        })
        .catch(() => {});
    }
  }, [currentUser?.uid]);

  const handleSelectRadius = async (km: number) => {
    setSearchRadiusKm(km);
    if (currentUser?.uid) {
      await (userPreferencesRepository as any).updatePreferences(currentUser.uid, {
        searchRadiusKm: km,
      });
    }
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
        <Text style={styles.headerTitle}>Location & Maps</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lokasi Terdeteksi</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MapPin size={22} color={theme.colors.terracotta} />
              <View style={styles.rowText}>
                <Text style={styles.locationTitle}>
                  {userLocation.district
                    ? `${userLocation.district}, ${userLocation.city}`
                    : userLocation.city || 'Jakarta'}
                </Text>
                <Text style={styles.locationSubtitle}>
                  {userLocation.address || 'Kawasan Sekitar'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radius Pencarian Kafe (Kilometer)</Text>
          <Text style={styles.sectionDescription}>
            Batas jarak pencarian tempat kuliner di tab Explore (satuan metrik km).
          </Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((km) => {
              const isSelected = Math.round(searchRadiusKm) === km;
              return (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.radiusChip,
                    isSelected && styles.radiusChipSelected,
                  ]}
                  onPress={() => handleSelectRadius(km)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      isSelected && styles.radiusChipTextSelected,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferensi Jurnal</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Sematkan Lokasi Otomatis</Text>
                <Text style={styles.toggleDesc}>
                  Secara otomatis mendeteksi tempat terdekat saat menulis jurnal baru.
                </Text>
              </View>
              <Switch
                value={autoAttachLocation}
                onValueChange={setAutoAttachLocation}
                trackColor={{ false: '#E2D9CF', true: theme.colors.terracotta }}
                thumbColor="#FFFFFF"
              />
            </View>
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
  sectionDescription: {
    fontSize: 13,
    color: '#7C675B',
    marginBottom: 12,
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
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#9E8579',
    marginTop: 2,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radiusChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8DED3',
    alignItems: 'center',
  },
  radiusChipSelected: {
    backgroundColor: '#FDEEE9',
    borderColor: theme.colors.terracotta,
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C675B',
  },
  radiusChipTextSelected: {
    color: theme.colors.terracotta,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    color: '#8A7569',
  },
});
