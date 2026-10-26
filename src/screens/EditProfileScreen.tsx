import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { theme } from '../config/theme';
import { UserProfile } from '../services/firebase/authService';
import {
  ArrowLeft,
  Camera,
  User,
  AtSign,
  Mail,
  Phone,
  ChevronRight,
  Plus,
  X,
  Check,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Coffee,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface EditProfileScreenProps {
  user: UserProfile;
  onBack: () => void;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  user,
  onBack,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Profile Header Images
  const [bannerUrl, setBannerUrl] = useState<string>(
    user.bannerURL ||
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80'
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  // Avatar Presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  ];

  // Basic Info (Step 1)
  const [name, setName] = useState(user.displayName || 'Vincentia');
  const [username, setUsername] = useState(user.username || 'vincentiaa');
  const [email, setEmail] = useState(user.email || 'vincentia@example.com');
  const [phone, setPhone] = useState(user.phoneNumber || '+62 812 3456 7890');
  const [bio, setBio] = useState(
    user.bio ||
      'Food enthusiast & specialty coffee lover based in Jakarta. Always on the hunt for cozy aesthetic cafes with great brews.'
  );

  // Culinary Preferences (Step 2)
  const availableCulinaryPreferences = [
    '☕ Kopi',
    '🍰 Dessert',
    '🍲 Makanan Berat',
    '🥨 Camilan',
    '🌱 Healthy Food',
    '🏪 Street Food',
    '🥐 Bakery & Pastry',
    '🍵 Teh & Matcha',
  ];
  const [selectedCulinary, setSelectedCulinary] = useState<string[]>(
    user.culinaryPreferences || ['☕ Kopi', '🍰 Dessert', '🍲 Makanan Berat']
  );

  // Favorite Venue Types (Step 2)
  const availableVenueTypes = [
    '☕ Café',
    '🍴 Restoran',
    '🥐 Bakery',
    '💎 Hidden Gem',
    '🏪 Street Food',
    '🍷 Fine Dining',
    '🌿 Outdoor / Garden',
    '💻 WFC Friendly',
  ];
  const [selectedVenues, setSelectedVenues] = useState<string[]>(
    user.favoriteVenueTypes || ['☕ Café', '🥐 Bakery', '💎 Hidden Gem']
  );

  // Budget Chips
  const budgetOptions = [
    '< Rp 50.000',
    'Rp 50.000 - 100.000',
    'Rp 100.000 - 250.000',
    '> Rp 250.000',
  ];
  const [selectedBudget, setSelectedBudget] = useState<string>(
    user.budgetPerVisit || 'Rp 50.000 - 100.000'
  );

  // Favorite Locations
  const [locations, setLocations] = useState<string[]>(
    user.favoriteLocations || ['Jakarta Barat', 'Jakarta Selatan']
  );

  // Socials
  const [instagram, setInstagram] = useState(user.socialInstagram || 'vincentiaa');
  const [tiktok, setTiktok] = useState(user.socialTikTok || 'vincentiaa');

  // Toggle Handlers
  const toggleCulinary = (item: string) => {
    if (selectedCulinary.includes(item)) {
      setSelectedCulinary(selectedCulinary.filter((c) => c !== item));
    } else {
      setSelectedCulinary([...selectedCulinary, item]);
    }
  };

  const toggleVenue = (item: string) => {
    if (selectedVenues.includes(item)) {
      setSelectedVenues(selectedVenues.filter((v) => v !== item));
    } else {
      setSelectedVenues([...selectedVenues, item]);
    }
  };

  const removeLocation = (loc: string) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  const handleAddLocationPrompt = () => {
    Alert.prompt
      ? Alert.prompt('Tambah Lokasi Favorit', 'Masukkan nama kota atau kawasan (misal: Menteng, Senopati, PIK):', [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tambah',
            onPress: (text) => {
              if (text && text.trim()) {
                setLocations([...locations, text.trim()]);
              }
            },
          },
        ])
      : Alert.alert('Tambah Lokasi', 'Lokasi PIK ditambahkan ke favorit.', [
          {
            text: 'OK',
            onPress: () => {
              if (!locations.includes('Pantai Indah Kapuk (PIK)')) {
                setLocations([...locations, 'Pantai Indah Kapuk (PIK)']);
              }
            },
          },
        ]);
  };

  const handleChangeBanner = () => {
    Alert.alert('Ganti Foto Banner', 'Pilih suasana banner baru untuk profil kamu:', [
      {
        text: 'Aesthetic Cafe',
        onPress: () =>
          setBannerUrl(
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80'
          ),
      },
      {
        text: 'Artisan Bakery',
        onPress: () =>
          setBannerUrl(
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80'
          ),
      },
      {
        text: 'Cozy Roastery',
        onPress: () =>
          setBannerUrl(
            'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80'
          ),
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleAddCustomAvatar = () => {
    Alert.alert('Unggah Foto Profil', 'Pilih sumber foto profil kamu:', [
      {
        text: 'Kamera',
        onPress: () =>
          setAvatarUrl(
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
          ),
      },
      {
        text: 'Galeri Foto',
        onPress: () =>
          setAvatarUrl(
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'
          ),
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleSaveProfile = (isDraft: boolean = false) => {
    const updated: Partial<UserProfile> = {
      displayName: name.trim() || 'Vincentia',
      username: username.trim() || 'vincentiaa',
      email: email.trim() || user.email,
      phoneNumber: phone.trim(),
      bio: bio.trim(),
      photoURL: avatarUrl,
      bannerURL: bannerUrl,
      culinaryPreferences: selectedCulinary,
      favoriteVenueTypes: selectedVenues,
      budgetPerVisit: selectedBudget,
      favoriteLocations: locations,
      socialInstagram: instagram.trim(),
      socialTikTok: tiktok.trim(),
    };

    onSave(updated);
    Alert.alert(
      isDraft ? 'Draft Disimpan' : 'Profil Berhasil Diperbarui!',
      isDraft
        ? 'Perubahan profil kamu telah disimpan sebagai draft.'
        : 'Informasi profil dan preferensi kuliner kamu telah diperbarui.'
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (currentStep === 2) {
              setCurrentStep(1);
            } else {
              onBack();
            }
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#4E2E21" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 2. Step Indicator Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarSegment,
              styles.progressBarActive,
            ]}
          />
          <View
            style={[
              styles.progressBarSegment,
              currentStep === 2 ? styles.progressBarActive : styles.progressBarInactive,
            ]}
          />
        </View>
        <Text style={styles.stepSubtitle}>
          {currentStep === 1
            ? 'Langkah 1 dari 2: Informasi Dasar'
            : 'Langkah 2 dari 2: Preferensi & Akun'}
        </Text>
      </View>

      {/* 3. Scrollable Content Body */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 ? (
          /* ========================================================== */
          /* STEP 1: INFORMASI DASAR                                    */
          /* ========================================================== */
          <View style={styles.stepContent}>
            {/* Hero Banner with Overlapping Avatar */}
            <View style={styles.heroSection}>
              <View style={styles.bannerWrapper}>
                <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
                <TouchableOpacity
                  style={styles.bannerChangeBadge}
                  onPress={handleChangeBanner}
                  activeOpacity={0.85}
                >
                  <Camera size={13} color="#FFFFFF" />
                  <Text style={styles.bannerChangeText}>Ganti Sampul</Text>
                </TouchableOpacity>
              </View>

              {/* Overlapping Avatar */}
              <View style={styles.avatarOverlapContainer}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarOverlapImage} />
                <TouchableOpacity
                  style={styles.avatarCameraBadge}
                  onPress={handleAddCustomAvatar}
                  activeOpacity={0.85}
                >
                  <Camera size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Section: Pilih Foto Profil Preset */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Foto Profil</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih foto preset cepat atau unggah foto dari galeri kamu
              </Text>

              <View style={styles.presetRow}>
                {avatarPresets.map((uri, idx) => {
                  const isSelected = avatarUrl === uri;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected,
                      ]}
                      onPress={() => setAvatarUrl(uri)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri }} style={styles.presetThumb} />
                      {isSelected && (
                        <View style={styles.presetCheckmarkBadge}>
                          <Check size={11} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Upload Button */}
                <TouchableOpacity
                  style={styles.presetUploadTile}
                  onPress={handleAddCustomAvatar}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color="#D04A1E" />
                  <Text style={styles.presetUploadText}>Upload</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section: Form Informasi Dasar */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>

              {/* Nama */}
              <View style={styles.inputFieldCard}>
                <View style={styles.inputFieldLeft}>
                  <View style={styles.inputIconCircle}>
                    <User size={15} color="#4E2E21" />
                  </View>
                  <View style={styles.inputFieldTextContainer}>
                    <Text style={styles.inputFieldLabel}>Nama Lengkap</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Masukkan nama lengkap"
                      placeholderTextColor="#A89F91"
                    />
                  </View>
                </View>
                {name.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setName('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Username */}
              <View style={styles.inputFieldCard}>
                <View style={styles.inputFieldLeft}>
                  <View style={styles.inputIconCircle}>
                    <AtSign size={15} color="#4E2E21" />
                  </View>
                  <View style={styles.inputFieldTextContainer}>
                    <Text style={styles.inputFieldLabel}>Username</Text>
                    <TextInput
                      style={styles.textInput}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="vincentiaa"
                      placeholderTextColor="#A89F91"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                {username.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setUsername('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputFieldCard}>
                <View style={styles.inputFieldLeft}>
                  <View style={styles.inputIconCircle}>
                    <Mail size={15} color="#4E2E21" />
                  </View>
                  <View style={styles.inputFieldTextContainer}>
                    <Text style={styles.inputFieldLabel}>Email</Text>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="vincentia@example.com"
                      placeholderTextColor="#A89F91"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                {email.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setEmail('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Nomor Telepon */}
              <View style={styles.inputFieldCard}>
                <View style={styles.inputFieldLeft}>
                  <View style={styles.inputIconCircle}>
                    <Phone size={15} color="#4E2E21" />
                  </View>
                  <View style={styles.inputFieldTextContainer}>
                    <Text style={styles.inputFieldLabel}>Nomor Telepon</Text>
                    <TextInput
                      style={styles.textInput}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+62 812 3456 7890"
                      placeholderTextColor="#A89F91"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                {phone.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setPhone('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section: Tentang Saya */}
            <View style={styles.sectionGroup}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Tentang Saya</Text>
                <Text style={styles.charCounter}>{bio.length}/200</Text>
              </View>

              <View style={styles.bioCard}>
                <TextInput
                  style={styles.bioTextInput}
                  value={bio}
                  onChangeText={(txt) => {
                    if (txt.length <= 200) setBio(txt);
                  }}
                  placeholder="Ceritakan sedikit tentang dirimu dan kecintaanmu pada petualangan kuliner..."
                  placeholderTextColor="#A89F91"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Step 1 Action Button */}
            <TouchableOpacity
              style={styles.nextStepBtn}
              onPress={() => setCurrentStep(2)}
              activeOpacity={0.88}
            >
              <Text style={styles.nextStepBtnText}>Lanjut ke Preferensi</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* ========================================================== */
          /* STEP 2: PREFERENSI KULINER & SOSIAL                        */
          /* ========================================================== */
          <View style={styles.stepContent}>
            {/* Section 1: Preferensi Kuliner */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Preferensi Kuliner</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih jenis kuliner dan minuman yang paling menggambarkan seleramu
              </Text>

              <View style={styles.chipsWrap}>
                {availableCulinaryPreferences.map((item, idx) => {
                  const isSelected = selectedCulinary.includes(item);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chipPill,
                        isSelected && styles.chipPillActive,
                      ]}
                      onPress={() => toggleCulinary(item)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipPillText,
                          isSelected && styles.chipPillTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Jenis Tempat Favorit */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Jenis Tempat Favorit</Text>
              <Text style={styles.sectionSubtitle}>
                Vibe atau suasana tempat nongkrong yang paling sering kamu kunjungi
              </Text>

              <View style={styles.chipsWrap}>
                {availableVenueTypes.map((item, idx) => {
                  const isSelected = selectedVenues.includes(item);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chipPill,
                        isSelected && styles.chipPillActive,
                      ]}
                      onPress={() => toggleVenue(item)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipPillText,
                          isSelected && styles.chipPillTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Budget per Kunjungan */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Budget per Kunjungan</Text>
              <Text style={styles.sectionSubtitle}>
                Estimasi rata-rata pengeluaran setiap kali berkunjung
              </Text>

              <View style={styles.chipsWrap}>
                {budgetOptions.map((b, idx) => {
                  const isSelected = selectedBudget === b;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chipPill,
                        isSelected && styles.chipPillActiveBudget,
                      ]}
                      onPress={() => setSelectedBudget(b)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipPillText,
                          isSelected && styles.chipPillTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                      {isSelected && (
                        <View style={styles.budgetCheckmark}>
                          <Check size={11} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: Lokasi Favorit */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Lokasi Favorit</Text>
              <Text style={styles.sectionSubtitle}>
                Area kuliner yang sering kamu explore di kotamu
              </Text>

              <View style={styles.locationsRow}>
                {locations.map((loc, idx) => (
                  <View key={idx} style={styles.locationPill}>
                    <MapPin size={13} color="#D04A1E" />
                    <Text style={styles.locationPillText}>{loc}</Text>
                    <TouchableOpacity
                      onPress={() => removeLocation(loc)}
                      style={styles.locationRemoveBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <X size={12} color="#6B3F2E" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addLocationBtn}
                  onPress={handleAddLocationPrompt}
                  activeOpacity={0.75}
                >
                  <Plus size={14} color="#4E2E21" />
                  <Text style={styles.addLocationText}>Tambah Lokasi</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 5: Akun Sosial */}
            <View style={styles.sectionGroup}>
              <Text style={styles.sectionTitle}>Akun Sosial (Opsional)</Text>
              <Text style={styles.sectionSubtitle}>
                Hubungkan media sosial kamu agar sesama penjelajah rasa bisa terhubung
              </Text>

              {/* Instagram Field */}
              <View style={styles.socialFieldCard}>
                <View style={styles.socialIconContainer}>
                  {/* Instagram Mark Svg */}
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      stroke="#E1306C"
                      strokeWidth="2"
                    />
                    <Circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2" />
                    <Circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" />
                  </Svg>
                </View>

                <View style={styles.socialInputGroup}>
                  <Text style={styles.socialPrefix}>@</Text>
                  <TextInput
                    style={styles.socialTextInput}
                    value={instagram}
                    onChangeText={setInstagram}
                    placeholder="vincentiaa"
                    placeholderTextColor="#A89F91"
                    autoCapitalize="none"
                  />
                </View>

                {instagram.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setInstagram('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>

              {/* TikTok Field */}
              <View style={styles.socialFieldCard}>
                <View style={styles.socialIconContainer}>
                  {/* TikTok Mark Svg */}
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.888 2.868 2.896 2.896 0 0 1-2.895-2.896 2.896 2.896 0 0 1 2.895-2.896c.29 0 .567.042.833.118V9.37a6.34 6.34 0 0 0-.833-.055A6.335 6.335 0 0 0 3 15.644 6.336 6.336 0 0 0 9.345 22a6.335 6.335 0 0 0 6.334-6.356V8.718a8.163 8.163 0 0 0 3.91 1.057v-3.09z"
                      fill="#000000"
                    />
                  </Svg>
                </View>

                <View style={styles.socialInputGroup}>
                  <Text style={styles.socialPrefix}>@</Text>
                  <TextInput
                    style={styles.socialTextInput}
                    value={tiktok}
                    onChangeText={setTiktok}
                    placeholder="vincentiaa"
                    placeholderTextColor="#A89F91"
                    autoCapitalize="none"
                  />
                </View>

                {tiktok.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconBtn}
                    onPress={() => setTiktok('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color="#9E9188" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Step 2 Bottom Buttons Row */}
            <View style={styles.step2ActionsRow}>
              <TouchableOpacity
                style={styles.draftBtn}
                onPress={() => handleSaveProfile(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.draftBtnText}>Simpan Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveProfileBtn}
                onPress={() => handleSaveProfile(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.saveProfileBtnText}>Perbarui Profil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 19,
    color: '#4E2E21',
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE4',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EFE7DE',
    overflow: 'hidden',
    gap: 6,
  },
  progressBarSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#D04A1E',
  },
  progressBarInactive: {
    backgroundColor: '#EFE7DE',
  },
  stepSubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#8C7E74',
    fontWeight: '500',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  /* Hero Banner & Overlapping Avatar */
  heroSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerWrapper: {
    width: '100%',
    height: 125,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E8DFD8',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerChangeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 46, 33, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  bannerChangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarOverlapContainer: {
    position: 'relative',
    marginTop: -48,
    width: 96,
    height: 96,
  },
  avatarOverlapImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3ECE4',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4E2E21',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* Sections */
  sectionGroup: {
    marginBottom: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: '#4E2E21',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8C7E74',
    marginBottom: 12,
    lineHeight: 17,
  },

  /* Presets */
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  presetCard: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    borderColor: '#EFE7DE',
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  presetCardSelected: {
    borderColor: '#D04A1E',
  },
  presetThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  presetCheckmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D04A1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  presetUploadTile: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D04A1E',
    backgroundColor: '#FDF7F3',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  presetUploadText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D04A1E',
  },

  /* Input Field Cards */
  inputFieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6F1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 11,
  },
  inputFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2E8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputFieldTextContainer: {
    flex: 1,
  },
  inputFieldLabel: {
    fontSize: 11,
    color: '#8C7E74',
    fontWeight: '600',
    marginBottom: 1,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4E2E21',
    padding: 0,
  },
  clearIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBE2D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* Bio */
  charCounter: {
    fontSize: 12,
    color: '#A89F91',
    fontWeight: '600',
  },
  bioCard: {
    backgroundColor: '#FAF6F1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    padding: 14,
    minHeight: 100,
  },
  bioTextInput: {
    fontSize: 13.5,
    color: '#4E2E21',
    lineHeight: 20,
    padding: 0,
    minHeight: 75,
  },

  /* Step 1 Next Button */
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E2E21',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
    gap: 8,
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  nextStepBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Step 2 Chips */
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#FAF6F1',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  chipPillActive: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
  },
  chipPillActiveBudget: {
    backgroundColor: '#4E2E21',
    borderColor: '#4E2E21',
    paddingRight: 10,
    gap: 6,
  },
  chipPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4336',
  },
  chipPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  budgetCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D04A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Locations */
  locationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E8DFD8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationPillText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#4E2E21',
  },
  locationRemoveBtn: {
    padding: 2,
    marginLeft: 2,
  },
  addLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#B8A89C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addLocationText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#4E2E21',
  },

  /* Social Field Card */
  socialFieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6F1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  socialIconContainer: {
    marginRight: 10,
  },
  socialInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C7E74',
    marginRight: 2,
  },
  socialTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#4E2E21',
    padding: 0,
  },

  /* Step 2 Bottom Buttons Row */
  step2ActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  draftBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D7C4B7',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E2E21',
  },
  saveProfileBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#4E2E21',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  saveProfileBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
