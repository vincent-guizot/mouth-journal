import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { placesService } from '../../src/services/places/placesService';
import { useAuth } from '../../src/context/AuthContext';
import { NearbyPlace } from '../../src/types/places';
import { theme } from '../../src/config/theme';

export default function PlacesSearchRoute() {
  const router = useRouter();
  const { userLocation } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NearbyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const places = await placesService.searchPlaces(
        userLocation.latitude,
        userLocation.longitude,
        5000,
        text.trim()
      );
      setResults(places);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
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
        <View style={styles.searchBar}>
          <Search size={18} color="#9E8579" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kafe, resto, atau kuliner..."
            placeholderTextColor="#9E8579"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.terracotta} />
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !isSearching && query.length >= 2 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ditemukan tempat untuk "{query}".</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: '/places/[placeId]',
                params: {
                  placeId: item.id,
                  initialData: JSON.stringify(item),
                },
              });
            }}
          >
            <View style={styles.iconWrapper}>
              <MapPin size={20} color={theme.colors.terracotta} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    padding: 6,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.coffeeBrown,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECE4',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDEEE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.coffeeBrown,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    color: '#7C675B',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E8579',
    textAlign: 'center',
  },
});
