import * as Location from 'expo-location';
import { UserLocation } from '../../types/places';

// Default fallback jika GPS belum aktif atau di simulator (Area Senopati / Jaksel)
const DEFAULT_FALLBACK_LOCATION: UserLocation = {
  latitude: -6.229746,
  longitude: 106.816431,
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  address: 'Kawasan Senopati, Jakarta Selatan'
};

export class LocationService {
  /**
   * Meminta izin akses lokasi dan mengembalikan posisi GPS pengguna saat ini
   */
  static async getCurrentLocation(): Promise<UserLocation> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[LocationService] Izin lokasi ditolak, menggunakan fallback lokasi default.');
        return DEFAULT_FALLBACK_LOCATION;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocoding untuk mendapatkan nama jalan & kota
      let address = 'Lokasi Saat Ini';
      let city = 'Jakarta';
      let district = '';

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          city = item.city || item.subregion || 'Jakarta';
          district = item.district || item.name || '';
          address = [item.street, item.district, item.city].filter(Boolean).join(', ') || address;
        }
      } catch (geoError) {
        console.warn('[LocationService] Gagal reverse geocode:', geoError);
      }

      return {
        latitude,
        longitude,
        address,
        city,
        district
      };
    } catch (error) {
      console.warn('[LocationService] Gagal mengambil lokasi GPS:', error);
      return DEFAULT_FALLBACK_LOCATION;
    }
  }

  /**
   * Menghitung jarak antara 2 titik koordinat (dalam meter) menggunakan rumus Haversine
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // radius bumi dalam meter
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }
}
