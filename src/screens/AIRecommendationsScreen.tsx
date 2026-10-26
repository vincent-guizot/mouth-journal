import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { theme } from '../config/theme';
import { IllustrationAssets } from '../config/assets';
import { NearbyPlace } from '../types/places';
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  Coffee,
  Utensils,
  Map as MapIcon,
  Store,
  Compass,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Lightbulb,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'places' | 'menus' | 'itineraries';

interface AIRecommendationsScreenProps {
  onBack: () => void;
  onPlaceSelect?: (place: NearbyPlace) => void;
  onOpenItinerary?: (itineraryId: string) => void;
}

export const AIRecommendationsScreen: React.FC<AIRecommendationsScreenProps> = ({
  onBack,
  onPlaceSelect,
  onOpenItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [likedPlaces, setLikedPlaces] = useState<Record<string, boolean>>({
    'titik-temu': false,
    'sawo-kecik': true,
    tanamera: true,
  });
  const [likedMenus, setLikedMenus] = useState<Record<string, boolean>>({
    'pandan-latte': false,
    'truffle-pasta': true,
    'choco-croissant': false,
  });
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Toggle favorite helper
  const togglePlaceLike = (id: string) => {
    setLikedPlaces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMenuLike = (id: string) => {
    setLikedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock places matching the designs
  const recommendedPlaces: NearbyPlace[] = [
    {
      id: 'titik-temu',
      name: 'Titik Temu Coffee',
      address: 'Cipete, Jakarta Selatan',
      mainCategory: 'drinks',
      mainCategoryLabel: 'CAFE',
      subCategory: 'cafe',
      subCategoryLabel: 'Café',
      latitude: -6.278,
      longitude: 106.802,
      photoUrl:
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      ratingAverage: 4.6,
      ratingCount: 760,
      tags: ['Café', 'Kopi', 'Suasana Cozy'],
    },
    {
      id: 'sawo-kecik',
      name: 'Sawo Kecik Restoran',
      address: 'Blok M, Jakarta Selatan',
      mainCategory: 'food',
      mainCategoryLabel: 'RESTORAN',
      subCategory: 'restaurant',
      subCategoryLabel: 'Restoran',
      latitude: -6.244,
      longitude: 106.801,
      photoUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      ratingAverage: 4.5,
      ratingCount: 540,
      tags: ['Restoran', 'Indonesia', 'Local'],
    },
    {
      id: 'tanamera-senopati',
      name: 'Tanamera Coffee Roastery',
      address: 'Senopati, Jakarta Selatan',
      mainCategory: 'drinks',
      mainCategoryLabel: 'CAFE',
      subCategory: 'cafe',
      subCategoryLabel: 'Café',
      latitude: -6.229,
      longitude: 106.816,
      photoUrl:
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      ratingAverage: 4.8,
      ratingCount: 1240,
      tags: ['Café', 'Kopi', 'Specialty'],
    },
  ];

  // Mock menus matching the design
  const recommendedMenus = [
    {
      id: 'pandan-latte',
      name: 'Pandan Latte',
      price: 40000,
      venue: 'Titik Temu Coffee',
      photoUrl:
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
      category: 'Kopi',
    },
    {
      id: 'truffle-pasta',
      name: 'Truffle Pasta',
      price: 98000,
      venue: 'Sawo Kecik Restoran',
      photoUrl:
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80',
      category: 'Makanan',
    },
    {
      id: 'choco-croissant',
      name: 'Chocolate Croissant',
      price: 42000,
      venue: 'Tanamera Coffee',
      photoUrl:
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
      category: 'Bakery',
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#4E2E21" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Recommendations</Text>

        <TouchableOpacity
          style={styles.insightsBtn}
          onPress={() => setShowInsightsModal(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color="#D04A1E" />
        </TouchableOpacity>
      </View>

      {/* 2. Horizontal Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Sparkles
              size={14}
              color={activeTab === 'all' ? '#FFFFFF' : '#4E2E21'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'all' && styles.tabPillTextActive,
              ]}
            >
              Untuk Kamu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'places' && styles.tabPillActive]}
            onPress={() => setActiveTab('places')}
            activeOpacity={0.8}
          >
            <Store size={14} color={activeTab === 'places' ? '#FFFFFF' : '#4E2E21'} />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'places' && styles.tabPillTextActive,
              ]}
            >
              Tempat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'menus' && styles.tabPillActive]}
            onPress={() => setActiveTab('menus')}
            activeOpacity={0.8}
          >
            <Utensils
              size={14}
              color={activeTab === 'menus' ? '#FFFFFF' : '#4E2E21'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'menus' && styles.tabPillTextActive,
              ]}
            >
              Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'itineraries' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('itineraries')}
            activeOpacity={0.8}
          >
            <Compass
              size={14}
              color={activeTab === 'itineraries' ? '#FFFFFF' : '#4E2E21'}
            />
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'itineraries' && styles.tabPillTextActive,
              ]}
            >
              Itinerary
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Scrollable Content Body */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card: AI Robot Mascot */}
        <TouchableOpacity
          style={styles.heroBannerCard}
          onPress={() => setShowInsightsModal(true)}
          activeOpacity={0.9}
        >
          <View style={styles.mascotCircle}>
            <Image
              source={IllustrationAssets.aiChefRobot}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.heroBannerContent}>
            <View style={styles.heroBannerTitleRow}>
              <Text style={styles.heroBannerTitle}>Rekomendasi Personal</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.heroBannerSubtitle}>
              Dibuat khusus untuk kamu berdasarkan jurnal, preferensi, dan aktivitas kuliner.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section 1: Tempat yang Mungkin Kamu Suka */}
        {(activeTab === 'all' || activeTab === 'places') && (
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Tempat yang Mungkin Kamu Suka</Text>
              <TouchableOpacity
                onPress={() => setActiveTab('places')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Lihat Semua &gt;</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardsScroll}
            >
              {recommendedPlaces.map((place) => {
                const isLiked = !!likedPlaces[place.id];
                return (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeCard}
                    onPress={() => onPlaceSelect && onPlaceSelect(place)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.placeCardImageContainer}>
                      <Image
                        source={{ uri: place.photoUrl }}
                        style={styles.placeCardImage}
                      />
                      <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => togglePlaceLike(place.id)}
                        activeOpacity={0.8}
                      >
                        <Heart
                          size={15}
                          color={isLiked ? '#D04A1E' : '#FFFFFF'}
                          fill={isLiked ? '#D04A1E' : 'rgba(0,0,0,0.3)'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.placeCardInfo}>
                      <Text style={styles.placeCardName} numberOfLines={1}>
                        {place.name}
                      </Text>

                      <View style={styles.ratingAndLocationRow}>
                        <Star size={12} color="#F39A28" fill="#F39A28" />
                        <Text style={styles.ratingScore}>
                          {(place.ratingAverage ?? 4.5).toFixed(1)}
                        </Text>
                        <Text style={styles.ratingCount}>
                          ({place.ratingCount || 120})
                        </Text>
                      </View>

                      <Text style={styles.placeAddressText} numberOfLines={1}>
                        {place.address}
                      </Text>

                      <View style={styles.placeTagsRow}>
                        {place.tags?.slice(0, 3).map((tag, idx) => (
                          <View key={idx} style={styles.placeTagPill}>
                            <Text style={styles.placeTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Section 2: Menu yang Mungkin Kamu Suka */}
        {(activeTab === 'all' || activeTab === 'menus') && (
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.titleWithIconRow}>
                <Coffee size={17} color="#4E2E21" />
                <Text style={styles.sectionTitle}>Menu yang Mungkin Kamu Suka</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveTab('menus')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Lihat Semua &gt;</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardsScroll}
            >
              {recommendedMenus.map((item) => {
                const isLiked = !!likedMenus[item.id];
                return (
                  <View key={item.id} style={styles.menuCard}>
                    <View style={styles.menuImageContainer}>
                      <Image
                        source={{ uri: item.photoUrl }}
                        style={styles.menuCardImage}
                      />
                      <TouchableOpacity
                        style={styles.heartBtnSmall}
                        onPress={() => toggleMenuLike(item.id)}
                        activeOpacity={0.8}
                      >
                        <Heart
                          size={13}
                          color={isLiked ? '#D04A1E' : '#FFFFFF'}
                          fill={isLiked ? '#D04A1E' : 'rgba(0,0,0,0.3)'}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.menuCardName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.menuCardPrice}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Section 3: Itinerary Kuliner untuk Kamu */}
        {(activeTab === 'all' || activeTab === 'itineraries') && (
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.titleWithIconRow}>
                <Compass size={17} color="#4E2E21" />
                <Text style={styles.sectionTitle}>Itinerary Kuliner untuk Kamu</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Itinerary Kuliner', 'Menampilkan daftar itinerary personal.')
                }
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Lihat Semua &gt;</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.itineraryCard}
              onPress={() => {
                if (onOpenItinerary) onOpenItinerary('itinerary-kemang');
                else
                  Alert.alert(
                    'Jelajah Café di Kemang',
                    'Rute: Titik Temu ➔ Sawo Kecik ➔ Kyō Dessert Bar. 3 spot cozy terkurasi khusus selera Anda!'
                  );
              }}
              activeOpacity={0.88}
            >
              <View style={styles.itineraryHeaderRow}>
                <View style={styles.itineraryTitleGroup}>
                  <View style={styles.itineraryRobotBadge}>
                    <Image
                      source={IllustrationAssets.aiChefRobot}
                      style={styles.itineraryRobotImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={styles.itineraryTitle}>Jelajah Café di Kemang</Text>
                    <Text style={styles.itinerarySubtitle}>3 Tempat • 1 Hari</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#8C7E74" />
              </View>

              {/* 3 Photos Preview Row */}
              <View style={styles.itineraryPhotosRow}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
                  }}
                  style={styles.itineraryThumb}
                />
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
                  }}
                  style={styles.itineraryThumb}
                />
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
                  }}
                  style={styles.itineraryThumb}
                />
              </View>

              <Text style={styles.itineraryDescription}>
                Rekomendasi rute café terbaik di Kemang berdasarkan preferensi kamu.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 4: Insight & Statistik Kuliner Kamu */}
        <View style={styles.sectionGroup}>
          <TouchableOpacity
            style={styles.statsHeaderRow}
            onPress={() => setShowInsightsModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.titleWithIconRow}>
              <Lightbulb size={17} color="#D04A1E" />
              <Text style={styles.sectionTitle}>Insight & Statistik Kuliner Kamu</Text>
            </View>
            <ChevronRight size={18} color="#8C7E74" />
          </TouchableOpacity>

          <View style={styles.statsMetricsRow}>
            {/* Metric 1 */}
            <View style={styles.statMetricCard}>
              <View style={styles.statIconHeader}>
                <Coffee size={16} color="#4E2E21" />
                <Text style={styles.statValue}>62%</Text>
              </View>
              <Text style={styles.statMetricName}>Kopi</Text>
              <Text style={styles.statMetricHelper}>Kategori favorit kamu</Text>
            </View>

            {/* Metric 2 */}
            <View style={styles.statMetricCard}>
              <View style={styles.statIconHeader}>
                <Star size={16} color="#F39A28" fill="#F39A28" />
                <Text style={styles.statValue}>4.6</Text>
              </View>
              <Text style={styles.statMetricName}>Rating Rata-rata</Text>
              <Text style={styles.statMetricHelper}>Standar selera kamu</Text>
            </View>

            {/* Metric 3 */}
            <View style={styles.statMetricCard}>
              <View style={styles.statIconHeader}>
                <MapPin size={16} color="#D04A1E" />
                <Text style={styles.statValue}>Senopati</Text>
              </View>
              <Text style={styles.statMetricName}>Area Favorit</Text>
              <Text style={styles.statMetricHelper}>Paling sering dikunjungi</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* SCREEN 3: POST-JOURNAL AI INSIGHTS MODAL                 */}
      {/* ======================================================== */}
      <Modal
        visible={showInsightsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsightsModal(false)}
      >
        <View style={styles.insightsModalContainer}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowInsightsModal(false)}
            >
              <X size={20} color="#4E2E21" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.insightsModalContent}
          >
            {/* Hero Mascot */}
            <View style={styles.insightsHeroSection}>
              <Image
                source={IllustrationAssets.aiChefRobot}
                style={styles.insightsHeroImage}
                resizeMode="contain"
              />
              <Text style={styles.insightsHeroTitle}>AI Insights</Text>
              <Text style={styles.insightsHeroHighlight}>
                Jurnal kamu berhasil disimpan!
              </Text>
              <Text style={styles.insightsHeroSubtitle}>
                Berikut beberapa insight dan rekomendasi untuk kamu.
              </Text>
            </View>

            {/* Ringkasan Pengalaman */}
            <View style={styles.insightsSection}>
              <Text style={styles.insightsSectionTitle}>Ringkasan Pengalaman</Text>
              <View style={styles.experienceSummaryCard}>
                <View style={styles.experienceSummaryHeader}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
                    }}
                    style={styles.experienceSummaryThumb}
                  />
                  <View style={styles.experienceSummaryInfo}>
                    <Text style={styles.experienceVenueName}>
                      Tanamera Coffee Roastery
                    </Text>
                    <Text style={styles.experienceDateText}>
                      12 Okt 2026 • 10:30
                    </Text>
                    <View style={styles.experienceTagsRow}>
                      <View style={styles.experienceTagPill}>
                        <Text style={styles.experienceTagText}>Kopi</Text>
                      </View>
                      <View style={styles.experienceTagPill}>
                        <Text style={styles.experienceTagText}>Pastry</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Insight Bubble */}
                <View style={styles.insightSpeechBubble}>
                  <Sparkles size={16} color="#D04A1E" style={{ marginTop: 2 }} />
                  <Text style={styles.insightSpeechText}>
                    Kamu tampaknya sangat menyukai café dengan suasana cozy dan menu
                    pastry. Rating kamu di atas rata-rata untuk kategori ini!
                  </Text>
                </View>
              </View>
            </View>

            {/* Rekomendasi Berikutnya */}
            <View style={styles.insightsSection}>
              <Text style={styles.insightsSectionTitle}>Rekomendasi Berikutnya</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.insightsHorizontalScroll}
              >
                {/* Suku Coffee */}
                <View style={styles.insightsPlaceCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsPlaceThumb}
                  />
                  <Text style={styles.insightsPlaceName} numberOfLines={1}>
                    Suku Coffee
                  </Text>
                  <View style={styles.insightsRatingRow}>
                    <Star size={11} color="#F39A28" fill="#F39A28" />
                    <Text style={styles.insightsRatingText}>4.7 (840)</Text>
                  </View>
                  <Text style={styles.insightsPlaceArea}>Blok M, Jakarta Selatan</Text>
                </View>

                {/* Little League */}
                <View style={styles.insightsPlaceCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsPlaceThumb}
                  />
                  <Text style={styles.insightsPlaceName} numberOfLines={1}>
                    Little League
                  </Text>
                  <View style={styles.insightsRatingRow}>
                    <Star size={11} color="#F39A28" fill="#F39A28" />
                    <Text style={styles.insightsRatingText}>4.6 (620)</Text>
                  </View>
                  <Text style={styles.insightsPlaceArea}>Cipete, Jakarta Selatan</Text>
                </View>

                {/* Twin House */}
                <View style={styles.insightsPlaceCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsPlaceThumb}
                  />
                  <Text style={styles.insightsPlaceName} numberOfLines={1}>
                    Twin House
                  </Text>
                  <View style={styles.insightsRatingRow}>
                    <Star size={11} color="#F39A28" fill="#F39A28" />
                    <Text style={styles.insightsRatingText}>4.5 (540)</Text>
                  </View>
                  <Text style={styles.insightsPlaceArea}>Kemang, Jakarta Selatan</Text>
                </View>
              </ScrollView>
            </View>

            {/* Menu yang Mungkin Kamu Suka */}
            <View style={styles.insightsSection}>
              <Text style={styles.insightsSectionTitle}>Menu yang Mungkin Kamu Suka</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.insightsHorizontalScroll}
              >
                <View style={styles.insightsMenuCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsMenuThumb}
                  />
                  <Text style={styles.insightsMenuName}>Matcha Latte</Text>
                  <Text style={styles.insightsMenuPrice}>Rp 40.000</Text>
                </View>

                <View style={styles.insightsMenuCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsMenuThumb}
                  />
                  <Text style={styles.insightsMenuName}>Croissant</Text>
                  <Text style={styles.insightsMenuPrice}>Rp 38.000</Text>
                </View>

                <View style={styles.insightsMenuCard}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&auto=format&fit=crop&q=80',
                    }}
                    style={styles.insightsMenuThumb}
                  />
                  <Text style={styles.insightsMenuName}>Burnt Cheesecake</Text>
                  <Text style={styles.insightsMenuPrice}>Rp 65.000</Text>
                </View>
              </ScrollView>
            </View>

            {/* Bottom Actions */}
            <TouchableOpacity
              style={styles.insightsPrimaryBtn}
              onPress={() => setShowInsightsModal(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.insightsPrimaryBtnText}>
                Lihat Rekomendasi Lainnya
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.insightsSecondaryBtn}
              onPress={() => {
                setShowInsightsModal(false);
                onBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.insightsSecondaryBtnText}>Kembali ke Home</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5DC',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 18,
    color: '#4E2E21',
  },
  insightsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Tabs */
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5DC',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE7DE',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4E2E21',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },

  /* Scroll Body */
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Hero Banner */
  heroBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7F0',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3D5',
    marginBottom: 20,
  },
  mascotCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF0E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  mascotImage: {
    width: 54,
    height: 54,
  },
  heroBannerContent: {
    flex: 1,
  },
  heroBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  heroBannerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: '#4E2E21',
  },
  betaBadge: {
    backgroundColor: '#D04A1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBannerSubtitle: {
    fontSize: 12,
    color: '#7D6A5D',
    lineHeight: 17,
    fontWeight: '500',
  },

  /* Section */
  sectionGroup: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: '#4E2E21',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#D04A1E',
  },
  horizontalCardsScroll: {
    gap: 12,
    paddingRight: 6,
  },

  /* Place Card */
  placeCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE7DE',
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeCardImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#E8DFD8',
  },
  placeCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeCardInfo: {
    padding: 10,
  },
  placeCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 3,
  },
  ratingAndLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
  },
  ratingCount: {
    fontSize: 11,
    color: '#8C7E74',
    fontWeight: '500',
  },
  placeAddressText: {
    fontSize: 11.5,
    color: '#8C7E74',
    fontWeight: '500',
    marginBottom: 8,
  },
  placeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  placeTagPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  placeTagText: {
    fontSize: 10,
    color: '#6B3F2E',
    fontWeight: '600',
  },

  /* Menu Card */
  menuCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  menuImageContainer: {
    width: '100%',
    height: 95,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
    backgroundColor: '#E8DFD8',
  },
  menuCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtnSmall: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  menuCardPrice: {
    fontSize: 11.5,
    color: '#D04A1E',
    fontWeight: '700',
  },

  /* Itinerary Card */
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  itineraryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itineraryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itineraryRobotBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF0E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryRobotImg: {
    width: 26,
    height: 26,
  },
  itineraryTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#4E2E21',
  },
  itinerarySubtitle: {
    fontSize: 11.5,
    color: '#8C7E74',
    fontWeight: '500',
  },
  itineraryPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  itineraryThumb: {
    flex: 1,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E8DFD8',
    resizeMode: 'cover',
  },
  itineraryDescription: {
    fontSize: 12,
    color: '#6B3F2E',
    lineHeight: 17,
  },

  /* Stats Section */
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statMetricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  statIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  statMetricName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  statMetricHelper: {
    fontSize: 10,
    color: '#8C7E74',
    lineHeight: 13,
  },

  /* ========================================================== */
  /* Screen 3: Post-Journal AI Insights Modal Styling          */
  /* ========================================================== */
  insightsModalContainer: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  modalTopBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE7DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  insightsHeroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  insightsHeroImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  insightsHeroTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: '#4E2E21',
    marginBottom: 4,
  },
  insightsHeroHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 4,
  },
  insightsHeroSubtitle: {
    fontSize: 12.5,
    color: '#8C7E74',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsSectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 15,
    color: '#4E2E21',
    marginBottom: 10,
  },
  experienceSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  experienceSummaryHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  experienceSummaryThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E8DFD8',
  },
  experienceSummaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  experienceVenueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  experienceDateText: {
    fontSize: 11.5,
    color: '#8C7E74',
    marginBottom: 5,
  },
  experienceTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  experienceTagPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  experienceTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B3F2E',
  },
  insightSpeechBubble: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FDF7F0',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3E4D4',
  },
  insightSpeechText: {
    flex: 1,
    fontSize: 12,
    color: '#5C4336',
    lineHeight: 17,
  },
  insightsHorizontalScroll: {
    gap: 10,
  },
  insightsPlaceCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  insightsPlaceThumb: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#E8DFD8',
  },
  insightsPlaceName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  insightsRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  insightsRatingText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4E2E21',
  },
  insightsPlaceArea: {
    fontSize: 10.5,
    color: '#8C7E74',
  },
  insightsMenuCard: {
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  insightsMenuThumb: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#E8DFD8',
  },
  insightsMenuName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  insightsMenuPrice: {
    fontSize: 11,
    color: '#D04A1E',
    fontWeight: '700',
  },
  insightsPrimaryBtn: {
    backgroundColor: '#4E2E21',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
  },
  insightsPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  insightsSecondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  insightsSecondaryBtnText: {
    color: '#8C7E74',
    fontSize: 13,
    fontWeight: '600',
  },
});
