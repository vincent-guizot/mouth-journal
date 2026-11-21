import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Map as MapIcon, List as ListIcon, RefreshCw } from 'lucide-react-native';
import { UserLocation } from '../../../types/places';

interface ExploreHeaderProps {
  userLocation: UserLocation;
  viewMode: 'map' | 'list';
  onToggleViewMode: (mode: 'map' | 'list') => void;
  onRefreshLocation?: () => void;
  isRefreshingLocation?: boolean;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  userLocation,
  viewMode,
  onToggleViewMode,
  onRefreshLocation,
  isRefreshingLocation = false,
}) => {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        style={styles.locationGroup}
        onPress={onRefreshLocation}
        disabled={!onRefreshLocation || isRefreshingLocation}
        accessibilityRole="button"
        accessibilityLabel="Perbarui lokasi saat ini"
      >
        <View style={styles.locationIconWrapper}>
          <MapPin size={16} color="#D04A1E" />
        </View>
        <View>
          <Text style={styles.locationLabel}>Lokasi Kamu</Text>
          <Text style={styles.locationName} numberOfLines={1}>
            {userLocation.source === 'gps'
              ? userLocation.district || userLocation.city || 'Lokasi saat ini'
              : 'Lokasi default (GPS tidak aktif)'}
          </Text>
        </View>
        <RefreshCw
          size={14}
          color="#8A7A6D"
          style={isRefreshingLocation ? styles.refreshIcon : undefined}
        />
      </TouchableOpacity>

      <View style={styles.toggleModeGroup}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => onToggleViewMode('map')}
          activeOpacity={0.8}
        >
          <MapIcon
            size={14}
            color={viewMode === 'map' ? '#FFFFFF' : '#4E2E21'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.toggleBtnText,
              viewMode === 'map' && styles.toggleBtnTextActive,
            ]}
          >
            Peta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => onToggleViewMode('list')}
          activeOpacity={0.8}
        >
          <ListIcon
            size={14}
            color={viewMode === 'list' ? '#FFFFFF' : '#4E2E21'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.toggleBtnText,
              viewMode === 'list' && styles.toggleBtnTextActive,
            ]}
          >
            Daftar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  refreshIcon: {
    opacity: 0.45,
  },
  locationIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationLabel: {
    fontSize: 10,
    color: '#8A7A6D',
    fontWeight: '600',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  toggleModeGroup: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
  },
  toggleBtnActive: {
    backgroundColor: '#4E2E21',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
});
