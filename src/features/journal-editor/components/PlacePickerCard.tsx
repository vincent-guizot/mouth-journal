import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { X, MapPin } from 'lucide-react-native';
import { NearbyPlace } from '../../../types/places';
import { theme } from '../../../config/theme';

interface PlacePickerCardProps {
  place: NearbyPlace;
  onChangePlace: () => void;
}

export const PlacePickerCard: React.FC<PlacePickerCardProps> = ({
  place,
  onChangePlace,
}) => {
  const hasPlace = Boolean(place && place.name);

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.badgeNumber}>
          <Text style={styles.badgeNumberText}>3</Text>
        </View>
        <Text style={styles.sectionHeading}>Tempat</Text>
      </View>

      {hasPlace ? (
        <View style={styles.selectedPlaceCard}>
          <Image
            source={{
              uri:
                place.photoUrl ||
                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80',
            }}
            style={styles.placeThumb}
          />
          <View style={styles.placeInfo}>
            <Text style={styles.placeNameText} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.placeAddressText} numberOfLines={1}>
              {place.address || 'Kawasan Sekitar'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.placeRemoveBtn}
            onPress={onChangePlace}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.emptyPlaceCard}
          onPress={onChangePlace}
          activeOpacity={0.8}
        >
          <View style={styles.emptyIconCircle}>
            <MapPin size={18} color={theme.colors.terracotta} />
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.emptyPlaceTitle}>Pilih Lokasi atau Kafe</Text>
            <Text style={styles.emptyPlaceSubtitle}>Ketuk untuk mencari tempat atau input manual</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D04A1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
  },
  selectedPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  placeThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 10,
  },
  placeInfo: {
    flex: 1,
  },
  placeNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  placeAddressText: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
  placeRemoveBtn: {
    padding: 6,
  },
  emptyPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyPlaceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  emptyPlaceSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
});
