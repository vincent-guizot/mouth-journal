import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { theme } from '../config/theme';
import { OnboardingMasterAssets } from '../config/assets';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  Star,
  Heart,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={11}
            color="#F39A28"
            fill={i <= rating ? '#F39A28' : 'none'}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row with 'Lewati' button */}
      <View style={styles.topBar}>
        <View style={{ width: 60 }} />
        <TouchableOpacity
          onPress={onComplete}
          style={styles.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Content */}
      <View style={styles.contentContainer}>
        {/* ================= STEP 0: CATAT PENGALAMAN KULINER ================= */}
        {currentStep === 0 && (
          <View style={styles.slideWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.heading}>Catat{'\n'}Pengalaman{'\n'}Kuliner Kamu</Text>
              <View style={styles.terracottaDivider} />
              <Text style={styles.subheading}>
                Abadikan setiap rasa, tempat, dan momen spesial dalam satu jurnal pribadi.
              </Text>
            </View>

            {/* Visual: Master Fanned Photos + Journal Card Collage */}
            <View style={styles.illustrationArea}>
              <Image
                source={OnboardingMasterAssets.journalCollage}
                style={{
                  width: width - 40,
                  height: 330,
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        )}

        {/* ================= STEP 1: TEMUKAN TEMPAT BARU ================= */}
        {currentStep === 1 && (
          <View style={styles.slideWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.heading}>Temukan{'\n'}Tempat Baru</Text>
              <View style={styles.terracottaDivider} />
              <Text style={styles.subheading}>
                Jelajahi café, restoran, dan hidden gem di sekitar kamu dengan peta interaktif.
              </Text>
            </View>

            {/* Visual: Map Card with Teardrop Pinpoints & Floating Venue Card */}
            <View style={styles.illustrationArea}>
              <View style={styles.mapMockCard}>
                {/* Background Grid Roads */}
                <View style={styles.mapGridRoad1} />
                <View style={styles.mapGridRoad2} />
                <View style={styles.mapGridRoad3} />
                <View style={styles.mapGridRoad4} />

                {/* 5 Pinpoints with food photos inside */}
                {/* Pin 1: Burger */}
                <View style={[styles.mapPinContainer, { top: 18, right: 75 }]}>
                  <View style={styles.pinCircle}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.pinThumb}
                    />
                  </View>
                  <View style={styles.pinTail} />
                </View>

                {/* Pin 2: Coffee */}
                <View style={[styles.mapPinContainer, { top: 55, left: 30 }]}>
                  <View style={styles.pinCircle}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.pinThumb}
                    />
                  </View>
                  <View style={styles.pinTail} />
                </View>

                {/* Pin 3: Steak */}
                <View style={[styles.mapPinContainer, { top: 125, right: 90 }]}>
                  <View style={styles.pinCircle}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.pinThumb}
                    />
                  </View>
                  <View style={styles.pinTail} />
                </View>

                {/* Pin 4: Croissant */}
                <View style={[styles.mapPinContainer, { top: 180, left: 24 }]}>
                  <View style={styles.pinCircle}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.pinThumb}
                    />
                  </View>
                  <View style={styles.pinTail} />
                </View>

                {/* Pin 5: Pancakes */}
                <View style={[styles.mapPinContainer, { top: 195, right: 30 }]}>
                  <View style={styles.pinCircle}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.pinThumb}
                    />
                  </View>
                  <View style={styles.pinTail} />
                </View>

                {/* Floating Bottom Venue Card */}
                <View style={styles.step2FloatingVenueCard}>
                  <View style={styles.venueCardTopRow}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
                      }}
                      style={styles.venueCardThumb}
                    />
                    <View style={styles.venueCardTextCol}>
                      <View style={styles.venueNameLine}>
                        <Text style={styles.venueCardName} numberOfLines={1}>
                          Tanamera Coffee Roastery
                        </Text>
                        <Bookmark size={13} color="#4E2E21" />
                      </View>
                      <Text style={styles.venueCardAddress} numberOfLines={1}>
                        Senopati, Jakarta Selatan
                      </Text>
                      <View style={styles.venueCardRatingRow}>
                        {renderStars(4.2)}
                        <Text style={styles.venueCardRatingNum}>4.2</Text>
                        <Text style={styles.venueCardRatingVotes}>(1.2K)</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#B09B8E" />
                  </View>

                  {/* 4 Mini Thumbnails Strip */}
                  <View style={styles.venueMiniStrip}>
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.miniThumb}
                    />
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.miniThumb}
                    />
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.miniThumb}
                    />
                    <Image
                      source={{
                        uri:
                          'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.miniThumb}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= STEP 2: SIMPAN TEMPAT DAN MENU FAVORIT ================= */}
        {currentStep === 2 && (
          <View style={styles.slideWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.heading}>Simpan{'\n'}Tempat dan Menu{'\n'}Favorit</Text>
              <View style={styles.terracottaDivider} />
              <Text style={styles.subheading}>
                Buat wishlist untuk tempat dan menu yang ingin kamu coba nanti.
              </Text>
            </View>

            {/* Visual: 3 Stacked Wishlist Cards */}
            <View style={styles.illustrationArea}>
              {/* Card 1: Master Place Wishlist Card with Heart Badge & Rays */}
              <View style={{ width: '100%', height: 160, marginBottom: 6, alignItems: 'center' }}>
                <Image
                  source={OnboardingMasterAssets.wishlistCard}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              </View>

              {/* Card 2: Ribeye Steak */}
              <View style={styles.wishlistCard}>
                <View style={styles.wishlistImageWrapper}>
                  <Image
                    source={{
                      uri:
                        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
                    }}
                    style={styles.wishlistImage}
                  />
                  <View style={styles.heartCircleBadge}>
                    <Heart size={14} color="#D04A1E" fill="#D04A1E" />
                  </View>
                </View>
                <View style={styles.wishlistInfoBox}>
                  <Text style={styles.wishlistTitle}>Ribeye Steak</Text>
                  <Text style={styles.wishlistPrice}>Rp 185.000</Text>
                </View>
              </View>

              {/* Card 3: Croissant */}
              <View style={styles.wishlistCard}>
                <View style={styles.wishlistImageWrapper}>
                  <Image
                    source={{
                      uri:
                        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
                    }}
                    style={styles.wishlistImage}
                  />
                  <View style={styles.heartCircleBadge}>
                    <Heart size={14} color="#D04A1E" fill="#D04A1E" />
                  </View>
                </View>
                <View style={styles.wishlistInfoBox}>
                  <Text style={styles.wishlistTitle}>Croissant</Text>
                  <Text style={styles.wishlistPrice}>Rp 38.000</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Navigation Area */}
      <View style={styles.bottomArea}>
        {currentStep < 2 ? (
          <View style={styles.bottomNavRow}>
            {/* Pagination Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    currentStep === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Circular Next Button */}
            <TouchableOpacity
              style={styles.circleNextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <ChevronRight size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.finalBottomContainer}>
            {/* Full Width Button */}
            <TouchableOpacity
              style={styles.startNowBtn}
              onPress={onComplete}
              activeOpacity={0.88}
            >
              <Text style={styles.startNowText}>Mulai Sekarang</Text>
            </TouchableOpacity>

            {/* Pagination Dots Below Button */}
            <View style={[styles.dotsRow, { justifyContent: 'center', marginTop: 14 }]}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    currentStep === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A675B',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  slideWrapper: {
    flex: 1,
  },
  titleArea: {
    marginTop: 6,
    marginBottom: 14,
  },
  heading: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 30,
    fontWeight: '800',
    color: '#4E2E21',
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  terracottaDivider: {
    width: 36,
    height: 3,
    backgroundColor: '#D04A1E',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 13,
    color: '#7A675B',
    lineHeight: 18,
  },
  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
  },

  /* Step 1 Styles */
  fannedPhotosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    marginBottom: -16,
    zIndex: 2,
  },
  fanPhoto: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fanPhotoLeft: {
    width: 95,
    height: 95,
    transform: [{ rotate: '-8deg' }],
    marginRight: -18,
    zIndex: 1,
  },
  fanPhotoCenter: {
    width: 110,
    height: 110,
    zIndex: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  fanPhotoRight: {
    width: 95,
    height: 95,
    transform: [{ rotate: '8deg' }],
    marginLeft: -18,
    zIndex: 1,
  },
  step1JournalCard: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    ...theme.shadows.card,
    zIndex: 4,
  },
  journalPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  journalPlaceName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 14,
    fontWeight: '800',
    color: '#4E2E21',
  },
  journalPlaceAddress: {
    fontSize: 11,
    color: '#8C7A70',
  },
  journalMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  journalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  journalMetaText: {
    fontSize: 11,
    color: '#7A675B',
  },
  handwritingNote: {
    fontFamily: theme.fonts.handwriting,
    fontSize: 16,
    color: '#4E2E21',
    lineHeight: 20,
    marginTop: 2,
  },
  decorativeRaysLeft: {
    position: 'absolute',
    top: 10,
    left: 8,
    gap: 3,
  },
  rayLine: {
    width: 14,
    height: 2.5,
    backgroundColor: '#D04A1E',
    borderRadius: 1,
    marginVertical: 1,
  },

  /* Step 2 Styles */
  mapMockCard: {
    width: '96%',
    height: 310,
    backgroundColor: '#F5F3EC',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 10,
  },
  mapGridRoad1: {
    position: 'absolute',
    top: -20,
    left: 60,
    width: 14,
    height: 350,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '25deg' }],
  },
  mapGridRoad2: {
    position: 'absolute',
    top: 40,
    left: -40,
    width: 350,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-15deg' }],
  },
  mapGridRoad3: {
    position: 'absolute',
    top: 150,
    left: 30,
    width: 14,
    height: 200,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-40deg' }],
  },
  mapGridRoad4: {
    position: 'absolute',
    top: 180,
    right: -10,
    width: 200,
    height: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '30deg' }],
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#D04A1E',
    elevation: 3,
  },
  pinThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D04A1E',
    marginTop: -1,
  },
  step2FloatingVenueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    ...theme.shadows.card,
    zIndex: 10,
  },
  venueCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueCardThumb: {
    width: 52,
    height: 44,
    borderRadius: 8,
  },
  venueCardTextCol: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
  },
  venueNameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueCardName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 12,
    fontWeight: '800',
    color: '#4E2E21',
    flex: 1,
    marginRight: 4,
  },
  venueCardAddress: {
    fontSize: 10,
    color: '#8C7A70',
    marginTop: 1,
  },
  venueCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueCardRatingNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4E2E21',
  },
  venueCardRatingVotes: {
    fontSize: 9,
    color: '#9E8579',
  },
  venueMiniStrip: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  miniThumb: {
    flex: 1,
    height: 38,
    borderRadius: 6,
  },

  /* Step 3 Styles */
  wishlistCard: {
    width: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE7DE',
    marginBottom: 10,
    ...theme.shadows.card,
  },
  wishlistImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 78,
  },
  wishlistImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartCircleBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  wishlistInfoBox: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  wishlistTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 13,
    fontWeight: '800',
    color: '#4E2E21',
  },
  wishlistSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  wishlistPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A675B',
    marginTop: 1,
  },

  /* Bottom Controls */
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#D04A1E',
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#E5D9CE',
  },
  circleNextBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4E2E21',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  finalBottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  startNowBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#4E2E21',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
