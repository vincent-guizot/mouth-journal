import React from 'react';
import { ViewStyle } from 'react-native';
import { NearbyPlace, UserLocation } from '../types/places';
import { InteractiveMap, MapMarkerItem } from './map/InteractiveMap';

interface MapViewComponentProps {
  userLocation: UserLocation;
  places: NearbyPlace[];
  selectedPlaceId?: string | null;
  onPlaceSelect?: (place: NearbyPlace) => void;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  style?: ViewStyle;
}

/**
 * Komponen MapViewComponent Reusable
 * Menggunakan InteractiveMap dengan pinpoint teardrop yang jelas dan warna yang dapat di-kustomisasi di mapPinTheme.ts
 */
export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  userLocation,
  places,
  selectedPlaceId,
  onPlaceSelect,
  onMapPress,
  style,
}) => {
  // Mapping dari NearbyPlace ke MapMarkerItem
  const markers: MapMarkerItem[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    mainCategory: p.mainCategory,
    subCategoryLabel: p.subCategoryLabel,
    address: p.address,
    rating: p.ratingAverage,
  }));

  const handleMarkerSelect = (marker: MapMarkerItem) => {
    if (onPlaceSelect) {
      const found = places.find((p) => p.id === marker.id);
      if (found) onPlaceSelect(found);
    }
  };

  return (
    <InteractiveMap
      center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
      userLocation={userLocation}
      markers={markers}
      selectedMarkerId={selectedPlaceId}
      onMarkerSelect={handleMarkerSelect}
      onMapPress={onMapPress}
      zoom={15}
      style={style}
    />
  );
};
