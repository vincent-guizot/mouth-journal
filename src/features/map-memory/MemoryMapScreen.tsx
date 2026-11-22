import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MapPin, Compass, UtensilsCrossed } from 'lucide-react-native';
import { InteractiveMap, MapMarkerItem } from '../../components/map/InteractiveMap';
import { VisitedPlace } from '../profile/profileAggregation';
import { MemoryMapCard } from './components/MemoryMapCard';
import { theme } from '../../config/theme';
import { UserLocation } from '../../types/places';

interface MemoryMapScreenProps {
  visitedPlaces: VisitedPlace[];
  userLocation?: UserLocation | null;
  loading: boolean;
  onBack: () => void;
  onViewJournals: (place: VisitedPlace) => void;
  onAddJournal: (place: VisitedPlace) => void;
}

type CategoryFilter = 'all' | 'food' | 'drinks' | 'wisata';

export const MemoryMapScreen: React.FC<MemoryMapScreenProps> = ({
  visitedPlaces,
  userLocation,
  loading,
  onBack,
  onViewJournals,
  onAddJournal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Filter places that have valid coordinates
  const placesWithCoords = useMemo(() => {
    return visitedPlaces.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
    );
  }, [visitedPlaces]);

  // Filter by category
  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'all') return placesWithCoords;
    return placesWithCoords.filter((p) => p.mainCategory === selectedCategory);
  }, [placesWithCoords, selectedCategory]);

  // Map markers for InteractiveMap
  const markers: MapMarkerItem[] = useMemo(() => {
    return filteredPlaces.map((p) => {
      // Color pin according to average rating
      let pinColor = '#8A7A6D'; // neutral
      if (p.averageRating >= 4.5) {
        pinColor = '#D04A1E'; // Terracotta radiant
      } else if (p.averageRating >= 3.8) {
        pinColor = '#E67E22'; // Warm amber
      } else if (p.averageRating >= 3.0) {
        pinColor = '#B8860B'; // Dark goldenrod
      }

      return {
        id: p.placeId,
        name: p.placeName,
        latitude: p.latitude as number,
        longitude: p.longitude as number,
        mainCategory: p.mainCategory || 'food',
        subCategoryLabel: p.subCategoryLabel,
        address: p.placeAddress,
        rating: p.averageRating,
        customColor: pinColor,
        customEmoji: p.mainCategory === 'drinks' ? '☕' : p.mainCategory === 'wisata' ? '🏞️' : '🍽️',
      };
    });
  }, [filteredPlaces]);

  // Selected place object for floating card
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return visitedPlaces.find((p) => p.placeId === selectedPlaceId) || null;
  }, [selectedPlaceId, visitedPlaces]);

  // Compute map center
  const centerCoords = useMemo(() => {
    if (filteredPlaces.length > 0) {
      // Average coordinate of visited places
      const avgLat =
        filteredPlaces.reduce((acc, p) => acc + (p.latitude as number), 0) / filteredPlaces.length;
      const avgLon =
        filteredPlaces.reduce((acc, p) => acc + (p.longitude as number), 0) / filteredPlaces.length;
      return { latitude: avgLat, longitude: avgLon };
    }
    if (userLocation) {
      return { latitude: userLocation.latitude, longitude: userLocation.longitude };
    }
    // Jakarta default fallback
    return { latitude: -6.2088, longitude: 106.8456 };
  }, [filteredPlaces, userLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#3D2C1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Peta Jejak Kuliner</Text>
          <Text style={styles.headerSubtitle}>
            {placesWithCoords.length} tempat tersimpan di peta
          </Text>
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Compass size={13} color={selectedCategory === 'all' ? '#FFFFFF' : '#6E6461'} />
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>
              Semua ({placesWithCoords.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'food' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('food')}
          >
            <UtensilsCrossed size={13} color={selectedCategory === 'food' ? '#FFFFFF' : '#6E6461'} />
            <Text style={[styles.filterChipText, selectedCategory === 'food' && styles.filterChipTextActive]}>
              Makanan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'drinks' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('drinks')}
          >
            <Text style={{ fontSize: 12 }}>☕</Text>
            <Text style={[styles.filterChipText, selectedCategory === 'drinks' && styles.filterChipTextActive]}>
              Minuman / Kafe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'wisata' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('wisata')}
          >
            <MapPin size={13} color={selectedCategory === 'wisata' ? '#FFFFFF' : '#6E6461'} />
            <Text style={[styles.filterChipText, selectedCategory === 'wisata' && styles.filterChipTextActive]}>
              Wisata Kuliner
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Map View */}
      <View style={styles.mapCanvas}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.terracotta} />
            <Text style={styles.loadingText}>Memuat peta jejak kuliner...</Text>
          </View>
        ) : placesWithCoords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MapPin size={36} color={theme.colors.terracotta} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Jejak di Peta</Text>
            <Text style={styles.emptySubtitle}>
              Tempat yang kamu ulas di jurnal dengan lokasi terverifikasi akan otomatis muncul di peta kenangan ini.
            </Text>
          </View>
        ) : (
          <InteractiveMap
            center={centerCoords}
            userLocation={userLocation || undefined}
            markers={markers}
            selectedMarkerId={selectedPlaceId}
            onMarkerSelect={(marker) => setSelectedPlaceId(marker.id)}
            onMapPress={() => setSelectedPlaceId(null)}
            zoom={filteredPlaces.length === 1 ? 15 : 12}
            style={styles.map}
          />
        )}

        {/* Floating Selected Place Card */}
        {selectedPlace && (
          <MemoryMapCard
            place={selectedPlace}
            onClose={() => setSelectedPlaceId(null)}
            onViewJournals={onViewJournals}
            onAddJournal={onAddJournal}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2B2321',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 1,
  },
  filterBar: {
    backgroundColor: '#FAF5EE',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  filterChipActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6461',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#8A7A6D',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FBEFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2321',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A6D',
    textAlign: 'center',
    lineHeight: 18,
  },
});
