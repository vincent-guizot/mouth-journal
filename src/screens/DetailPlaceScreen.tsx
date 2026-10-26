import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { NearbyPlace } from '../types/places';
import { theme } from '../config/theme';
import {
  ArrowLeft,
  Images,
  Star,
  Navigation,
  Bookmark,
  Share2,
  BookmarkPlus,
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronDown,
  Copy,
  ExternalLink,
  Map as MapIcon,
  Edit3,
  Sparkles,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react-native';

interface DetailPlaceScreenProps {
  place: NearbyPlace;
  onBack: () => void;
  onWriteJournal: (place: NearbyPlace) => void;
  onToggleWishlist?: (place: NearbyPlace) => void;
}

export const DetailPlaceScreen: React.FC<DetailPlaceScreenProps> = ({
  place,
  onBack,
  onWriteJournal,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'menu' | 'foto' | 'ulasan'>('ringkasan');
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fallbackImage =
    place.photoUrl ||
    (place.mainCategory === 'drinks'
      ? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
      : place.mainCategory === 'wisata'
      ? 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');

  const popularMenus = [
    {
      name: place.mainCategory === 'wisata' ? 'Tiket Masuk Reguler' : 'Latte',
      price: place.mainCategory === 'wisata' ? 25000 : 45000,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: place.mainCategory === 'wisata' ? 'Sewa Tikar Piknik' : 'Cappuccino',
      price: place.mainCategory === 'wisata' ? 20000 : 42000,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: place.mainCategory === 'wisata' ? 'Paket Foto / Spot' : 'Croissant',
      price: place.mainCategory === 'wisata' ? 50000 : 38000,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: place.mainCategory === 'wisata' ? 'Minuman Dingin' : 'Ice Americano',
      price: place.mainCategory === 'wisata' ? 15000 : 35000,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const aiMenus = [
    {
      name: 'Signature Latte',
      price: 42000,
      reason: 'Sering dicoba oleh pengguna dengan selera seperti kamu.',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Almond Croissant',
      price: 45000,
      reason: 'Cocok dengan preferensi pastry kamu.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Truffle Pasta',
      price: 98000,
      reason: 'Populer di kalangan pencinta savory food.',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const similarPlaces = [
    {
      name: 'Giyanti Coffee Roastery',
      rating: 4.6,
      count: 960,
      area: 'Menteng, Jakarta Pusat',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Titik Temu Coffee',
      rating: 4.5,
      count: 760,
      area: 'Cipete, Jakarta Selatan',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sawo Kecik Restoran',
      rating: 4.4,
      count: 540,
      area: 'Blok M, Jakarta Selatan',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    Linking.openURL(url);
  };

  const handleCopyPhone = () => {
    Alert.alert('Nomor Telepon Disalin', place.phone || '+62 21 7278 1234');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://tanamera.id');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: fallbackImage }} style={styles.heroImage} resizeMode="cover" />

          {/* Floating Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <ArrowLeft size={20} color={theme.colors.coffeeBrown} />
          </TouchableOpacity>

          {/* Image Counter Badge */}
          <View style={styles.photoBadge}>
            <Images size={12} color="#FFFFFF" />
            <Text style={styles.photoBadgeText}>1/10</Text>
          </View>
        </View>

        {/* 2. Place Info Header */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.placeTitle}>{place.name}</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {place.subCategoryLabel || (place.mainCategory === 'drinks' ? 'Kopi/Cafe' : 'Restoran')}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={15} color={theme.colors.caramel} fill={theme.colors.caramel} />
            ))}
            <Text style={styles.ratingScore}>{place.ratingAverage || 4.2}</Text>
            <Text style={styles.reviewCount}>({place.userVisitedCount ? `${place.userVisitedCount}K` : '1.2K'} ulasan)</Text>
          </View>
        </View>

        {/* 3. 4 Action Circular Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtnItem} onPress={handleOpenMaps}>
            <View style={styles.actionIconCircle}>
              <Navigation size={18} color={theme.colors.coffeeBrown} />
            </View>
            <Text style={styles.actionLabel}>Rute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnItem}
            onPress={() => {
              setIsSaved(!isSaved);
              if (onToggleWishlist) onToggleWishlist(place);
            }}
          >
            <View style={[styles.actionIconCircle, isSaved && styles.actionIconCircleActive]}>
              <Bookmark
                size={18}
                color={isSaved ? '#FFFFFF' : theme.colors.coffeeBrown}
                fill={isSaved ? theme.colors.terracotta : 'transparent'}
              />
            </View>
            <Text style={styles.actionLabel}>{isSaved ? 'Tersimpan' : 'Simpan'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnItem}
            onPress={() => Alert.alert('Bagikan', `Bagikan link rekomendasi ${place.name} ke teman.`)}
          >
            <View style={styles.actionIconCircle}>
              <Share2 size={18} color={theme.colors.coffeeBrown} />
            </View>
            <Text style={styles.actionLabel}>Bagikan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnItem}
            onPress={() => {
              if (onToggleWishlist) onToggleWishlist(place);
              Alert.alert('Wishlist', `"${place.name}" ditambahkan ke Wishlist Anda!`);
            }}
          >
            <View style={styles.actionIconCircle}>
              <BookmarkPlus size={18} color={theme.colors.coffeeBrown} />
            </View>
            <Text style={styles.actionLabel}>Tambah ke Wishlist</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Tab Segment Header */}
        <View style={styles.tabBar}>
          {(['ringkasan', 'menu', 'foto', 'ulasan'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels: Record<string, string> = {
              ringkasan: 'Ringkasan',
              menu: 'Menu',
              foto: 'Foto',
              ulasan: 'Ulasan',
            };
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {labels[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Detail Info Rows */}
        <View style={styles.detailsCard}>
          {/* Alamat */}
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.terracotta} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                {place.address ? place.address.split(',')[0] : 'Senopati, Jakarta Selatan'}
              </Text>
              <Text style={styles.infoSubtitle}>
                {place.address || 'Jl. Senopati No. 72, Kebayoran Baru, Jakarta Selatan 12190'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleOpenMaps} style={styles.rowActionBtn}>
              <MapIcon size={18} color={theme.colors.coffeeBrown} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Jam Operasional */}
          <View style={styles.infoRow}>
            <Clock size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoOpenText}>
                Buka sekarang · <Text style={{ color: theme.colors.espresso }}>07.00 – 22.00</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.rowActionBtn}>
              <ChevronDown size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Telepon */}
          <View style={styles.infoRow}>
            <Phone size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{place.phone || '+62 21 7278 1234'}</Text>
            </View>
            <TouchableOpacity onPress={handleCopyPhone} style={styles.rowActionBtn}>
              <Copy size={16} color={theme.colors.coffeeBrown} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Website */}
          <View style={styles.infoRow}>
            <Globe size={18} color={theme.colors.coffeeBrown} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLinkText}>https://tanamera.id</Text>
            </View>
            <TouchableOpacity onPress={handleOpenWebsite} style={styles.rowActionBtn}>
              <ExternalLink size={16} color={theme.colors.coffeeBrown} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Deskripsi Tempat */}
        <View style={styles.descSection}>
          <Text style={styles.descText} numberOfLines={isExpanded ? undefined : 2}>
            {place.cuisine
              ? `${place.name} menyajikan pilihan istimewa: ${place.cuisine}. Suasana sangat nyaman untuk nongkrong, bekerja santai, atau kumpul bersama teman.`
              : 'Coffee roastery yang terkenal dengan biji kopi lokal berkualitas dan suasana yang nyaman. Cocok untuk ngopi, bekerja, atau sekadar bersantai bersama teman.'}
          </Text>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandRow}>
            <Text style={styles.expandText}>{isExpanded ? 'Tutup kembali ⌃' : 'Lihat selengkapnya ⌄'}</Text>
          </TouchableOpacity>
        </View>

        {/* 7. Menu Populer */}
        <View style={styles.popularMenuSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {place.mainCategory === 'wisata' ? 'Aktivitas Populer' : 'Menu Populer'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua &gt;</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
            {popularMenus.map((item, idx) => (
              <View key={idx} style={styles.menuItemCard}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                <Text style={styles.menuItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.menuItemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* AI Recommendations Section [BETA] (Matching Screen 2) */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiHeaderTitleGroup}>
              <Sparkles size={16} color="#D04A1E" />
              <Text style={styles.aiHeaderTitle}>AI Recommendations</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaBadgeText}>BETA</Text>
              </View>
            </View>
          </View>
          <Text style={styles.aiHeaderSubtitle}>
            Rekomendasi menu dan informasi berdasarkan preferensi dan pengalaman kuliner kamu.
          </Text>

          {/* AI Recommended Menus */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiMenuScroll}>
            {aiMenus.map((item, idx) => (
              <View key={idx} style={styles.aiMenuCard}>
                <Image source={{ uri: item.image }} style={styles.aiMenuImage} />
                <Text style={styles.aiMenuName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.aiMenuReason} numberOfLines={2}>{item.reason}</Text>
                <Text style={styles.aiMenuPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Kenapa direkomendasikan box */}
          <View style={styles.whyBox}>
            <View style={styles.whyHeaderRow}>
              <Lightbulb size={15} color="#D04A1E" />
              <Text style={styles.whyTitle}>Kenapa direkomendasikan?</Text>
            </View>
            <View style={styles.whyItem}>
              <CheckCircle2 size={13} color="#D04A1E" />
              <Text style={styles.whyText}>Kamu sering mencatat tempat dengan suasana cozy.</Text>
            </View>
            <View style={styles.whyItem}>
              <CheckCircle2 size={13} color="#D04A1E" />
              <Text style={styles.whyText}>Kamu menyukai menu kopi dan pastry.</Text>
            </View>
            <View style={styles.whyItem}>
              <CheckCircle2 size={13} color="#D04A1E" />
              <Text style={styles.whyText}>Pengguna lain dengan preferensi serupa memberi rating tinggi.</Text>
            </View>
          </View>
        </View>

        {/* Tempat Serupa yang Mungkin Kamu Suka (Matching Screen 2) */}
        <View style={styles.popularMenuSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tempat Serupa yang Mungkin Kamu Suka</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua &gt;</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
            {similarPlaces.map((sp, idx) => (
              <View key={idx} style={styles.similarPlaceCard}>
                <Image source={{ uri: sp.image }} style={styles.similarPlaceImage} />
                <Text style={styles.menuItemName} numberOfLines={1}>{sp.name}</Text>
                <View style={styles.similarRatingRow}>
                  <Star size={11} color="#F39A28" fill="#F39A28" />
                  <Text style={styles.similarRatingScore}>{sp.rating} ({sp.count})</Text>
                </View>
                <Text style={styles.similarAreaText}>{sp.area}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 8. Sticky Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.writeJournalBtn}
          onPress={() => onWriteJournal(place)}
          activeOpacity={0.85}
        >
          <Edit3 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.writeJournalText}>Write Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#FAF5EE',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  mainInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeTitle: {
    flex: 1,
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginRight: 8,
  },
  categoryPill: {
    backgroundColor: theme.colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
    marginLeft: 6,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  actionBtnItem: {
    alignItems: 'center',
    width: 75,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  actionIconCircleActive: {
    backgroundColor: theme.colors.terracotta,
    borderColor: theme.colors.terracotta,
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.coffeeBrown,
    textAlign: 'center',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DC',
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    paddingVertical: 10,
    marginRight: 24,
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: theme.colors.coffeeBrown,
  },
  tabText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.coffeeBrown,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: '#FAF5EE',
    marginHorizontal: theme.spacing.lg,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F0E8DC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  infoSubtitle: {
    fontSize: 11,
    color: theme.colors.espresso,
    marginTop: 1,
  },
  infoOpenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  infoLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  rowActionBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE3D3',
  },
  descSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: 14,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.espresso,
  },
  expandRow: {
    marginTop: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  popularMenuSection: {
    marginTop: 16,
    paddingLeft: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: theme.spacing.lg,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.coffeeBrown,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  menuScroll: {
    paddingRight: theme.spacing.lg,
  },
  menuItemCard: {
    width: 110,
    marginRight: 10,
  },
  menuItemImage: {
    width: 110,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.coffeeBrown,
  },
  menuItemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.espresso,
    marginTop: 1,
  },

  /* AI Recommendations Section */
  aiSection: {
    backgroundColor: '#FDF7F0',
    marginHorizontal: theme.spacing.lg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3D5',
    marginBottom: theme.spacing.xl,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiHeaderTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#4E2E21',
  },
  betaBadge: {
    backgroundColor: '#D04A1E',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  betaBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiHeaderSubtitle: {
    fontSize: 12,
    color: '#7D6A5D',
    lineHeight: 16,
    marginBottom: 12,
  },
  aiMenuScroll: {
    marginBottom: 12,
  },
  aiMenuCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  aiMenuImage: {
    width: '100%',
    height: 85,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#E8DFD8',
  },
  aiMenuName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
    marginBottom: 2,
  },
  aiMenuReason: {
    fontSize: 10.5,
    color: '#8C7E74',
    lineHeight: 14,
    marginBottom: 4,
  },
  aiMenuPrice: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D04A1E',
  },
  whyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E5DC',
    gap: 6,
  },
  whyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  whyTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E2E21',
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  whyText: {
    flex: 1,
    fontSize: 11.5,
    color: '#6B3F2E',
    lineHeight: 16,
  },

  /* Similar Places */
  similarPlaceCard: {
    width: 130,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  similarPlaceImage: {
    width: '100%',
    height: 75,
    borderRadius: 8,
    marginBottom: 6,
  },
  similarRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  similarRatingScore: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4E2E21',
  },
  similarAreaText: {
    fontSize: 10,
    color: '#8C7E74',
    marginTop: 1,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E8DC',
  },
  writeJournalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.coffeeBrown,
    paddingVertical: 14,
    borderRadius: 14,
    ...theme.shadows.card,
  },
  writeJournalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
