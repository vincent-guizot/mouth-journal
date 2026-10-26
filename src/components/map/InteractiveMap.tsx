import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { UserLocation } from '../../types/places';
import { MAP_PIN_THEME, getPinStyleForCategory } from '../../config/mapPinTheme';
import { theme } from '../../config/theme';
import { Navigation, Plus, Minus } from 'lucide-react-native';

export interface MapMarkerItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  mainCategory?: 'food' | 'drinks' | 'wisata' | string;
  subCategoryLabel?: string;
  address?: string;
  customColor?: string;
  customEmoji?: string;
  rating?: number;
}

export interface InteractiveMapProps {
  center: { latitude: number; longitude: number };
  userLocation?: UserLocation;
  markers: MapMarkerItem[];
  selectedMarkerId?: string | null;
  onMarkerSelect?: (marker: MapMarkerItem) => void;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  zoom?: number;
  height?: number | string;
  showControls?: boolean;
  style?: ViewStyle;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  userLocation,
  markers,
  selectedMarkerId,
  onMarkerSelect,
  onMapPress,
  zoom = 15,
  height = '100%',
  showControls = true,
  style,
}) => {
  const htmlContent = useMemo(() => {
    const markersJson = JSON.stringify(markers);
    const themeJson = JSON.stringify(MAP_PIN_THEME);
    const selectedId = selectedMarkerId || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
          
          /* Efek Radar Gelombang Animasi untuk GPS Pengguna */
          .user-pulse-container {
            position: relative;
            width: 32px;
            height: 32px;
          }
          .user-pulse-ring {
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${MAP_PIN_THEME.userLocation.pulseColor};
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
          .user-dot {
            position: absolute;
            top: 6px;
            left: 6px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${MAP_PIN_THEME.userLocation.dotColor};
            border: 3px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(37,99,235,0.6);
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.4); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }

          /* Pinpoint Teardrop SVG Styling */
          .pin-wrapper {
            cursor: pointer;
            transition: transform 0.25s ease-out;
            filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.3));
          }
          .pin-wrapper:hover {
            transform: scale(1.15) translateY(-4px);
          }
          .pin-wrapper.selected {
            transform: scale(1.22) translateY(-6px);
            filter: drop-shadow(0px 6px 12px ${MAP_PIN_THEME.selectedPin.ringColor});
          }

          /* Popup Styling */
          .leaflet-popup-content-wrapper {
            border-radius: 14px;
            padding: 6px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          }
          .popup-content {
            padding: 2px 4px;
          }
          .popup-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            color: #FFFFFF;
            margin-bottom: 4px;
          }
          .popup-title {
            font-weight: 800;
            font-size: 14px;
            color: #2B2321;
            margin-bottom: 2px;
          }
          .popup-address {
            font-size: 11px;
            color: #6E6461;
            line-height: 14px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const centerLat = ${center.latitude};
          const centerLon = ${center.longitude};
          const markers = ${markersJson};
          const pinTheme = ${themeJson};
          const selectedId = "${selectedId}";

          // Inisialisasi Peta
          const map = L.map('map', { 
            zoomControl: false,
            attributionControl: false 
          }).setView([centerLat, centerLon], ${zoom});

          // Menggunakan Carto Voyager Tiles yang halus & estetik
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
          }).addTo(map);

          // 1. Render Pinpoint Pengguna (GPS)
          ${
            userLocation
              ? `
            const userIcon = L.divIcon({
              className: 'user-pin-div',
              html: '<div class="user-pulse-container"><div class="user-pulse-ring"></div><div class="user-dot"></div></div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon }).addTo(map)
              .bindPopup("<b>📍 Lokasi Anda Saat Ini</b>");
          `
              : ''
          }

          // 2. Helper Membuat Teardrop SVG Pinpoint yang Tajam
          function createTeardropPinHtml(bgColor, emoji, isSelected) {
            const w = isSelected ? 38 : 32;
            const h = isSelected ? 48 : 42;
            const ringStroke = isSelected ? 'stroke="' + pinTheme.selectedPin.ringColor + '" stroke-width="3"' : '';

            return '<div class="pin-wrapper ' + (isSelected ? 'selected' : '') + '">' +
              '<svg width="' + w + '" height="' + h + '" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                // Badan Teardrop Pin
                '<path d="M16 0C7.16 0 0 7.16 0 16C0 26.5 13.5 39.5 15.1 41.1C15.6 41.6 16.4 41.6 16.9 41.1C18.5 39.5 32 26.5 32 16C32 7.16 24.84 0 16 0Z" fill="' + bgColor + '" ' + ringStroke + '/>' +
                // Lingkaran Putih di Dalam
                '<circle cx="16" cy="15" r="10.5" fill="#FFFFFF"/>' +
                // Emoji Icon di Tengah
                '<text x="16" y="19.5" font-size="11" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">' + emoji + '</text>' +
              '</svg>' +
            '</div>';
          }

          // 3. Render Setiap Marker Pinpoint
          markers.forEach(m => {
            const cat = m.mainCategory || 'food';
            let catStyle = pinTheme.food;
            if (cat === 'drinks') catStyle = pinTheme.drinks;
            if (cat === 'wisata') catStyle = pinTheme.wisata;

            const bgColor = m.customColor || catStyle.background;
            const emoji = m.customEmoji || catStyle.emoji;
            const isSelected = m.id === selectedId;

            const iconWidth = isSelected ? 38 : 32;
            const iconHeight = isSelected ? 48 : 42;

            const pinIcon = L.divIcon({
              className: 'custom-teardrop-marker',
              html: createTeardropPinHtml(bgColor, emoji, isSelected),
              iconSize: [iconWidth, iconHeight],
              iconAnchor: [iconWidth / 2, iconHeight] // Ujung runcing pin tepat di koordinat!
            });

            const marker = L.marker([m.latitude, m.longitude], { icon: pinIcon }).addTo(map);

            const popupHtml = 
              '<div class="popup-content">' +
                '<span class="popup-badge" style="background-color: ' + bgColor + ';">' + emoji + ' ' + (m.subCategoryLabel || cat.toUpperCase()) + '</span>' +
                '<div class="popup-title">' + m.name + '</div>' +
                '<div class="popup-address">' + (m.address || '') + '</div>' +
              '</div>';
            marker.bindPopup(popupHtml);

            marker.on('click', () => {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_MARKER', markerId: m.id }));
              }
            });
          });

          // 4. Klik Pada Peta (OnMapPress)
          map.on('click', (e) => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'MAP_CLICK', 
                latitude: e.latlng.lat, 
                longitude: e.latlng.lng 
              }));
            }
          });
        </script>
      </body>
      </html>
    `;
  }, [center, userLocation, markers, selectedMarkerId, zoom]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_MARKER' && onMarkerSelect) {
        const found = markers.find((m) => m.id === data.markerId);
        if (found) onMarkerSelect(found);
      } else if (data.type === 'MAP_CLICK' && onMapPress) {
        onMapPress({ latitude: data.latitude, longitude: data.longitude });
      }
    } catch (e) {
      console.warn('Error handling WebView message:', e);
    }
  };

  return (
    <View style={[styles.container, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E1D5',
    position: 'relative',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
  },
});
