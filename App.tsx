import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Caveat_600SemiBold,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";
import { Header } from "./src/components/Header";
import { BottomNavBar, TabType } from "./src/components/BottomNavBar";
import { DiaryScreen } from "./src/screens/DiaryScreen";
import { ExploreScreen } from "./src/screens/ExploreScreen";
import { WishlistScreen } from "./src/screens/WishlistScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { AddLogScreen } from "./src/screens/AddLogScreen";
import { DetailPlaceScreen } from "./src/screens/DetailPlaceScreen";
import { DetailJournalScreen } from "./src/screens/DetailJournalScreen";
import { EditJournalScreen } from "./src/screens/EditJournalScreen";
import { EditProfileScreen } from "./src/screens/EditProfileScreen";
import { AIRecommendationsScreen } from "./src/screens/AIRecommendationsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import { SplashScreen } from "./src/screens/SplashScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { AuthModal } from "./src/screens/AuthModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserLocation, NearbyPlace } from "./src/types/places";
import { DiaryEntry } from "./src/types/diary";
import { LocationService } from "./src/services/places/locationService";
import { placesService } from "./src/services/places/placesService";
import { journalRepository } from "./src/repositories";
import {
  AuthService,
  UserProfile,
  DEMO_USER,
} from "./src/services/firebase/authService";
import { theme } from "./src/config/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    Caveat_600SemiBold,
    Caveat_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("diary");
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: -6.229746,
    longitude: 106.816431,
    city: "Jakarta Selatan",
    district: "Senopati",
    address: "Senopati, Jakarta Selatan",
  });
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [selectedPlaceForLog, setSelectedPlaceForLog] =
    useState<NearbyPlace | null>(null);
  const [selectedPlaceForDetail, setSelectedPlaceForDetail] =
    useState<NearbyPlace | null>(null);
  const [selectedJournalForDetail, setSelectedJournalForDetail] =
    useState<DiaryEntry | null>(null);
  const [editingJournal, setEditingJournal] = useState<DiaryEntry | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAIRecommendationsOpen, setIsAIRecommendationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Load User & GPS Location on startup
  useEffect(() => {
    const initApp = async () => {
      // Check onboarding status
      try {
        const onboarded = await AsyncStorage.getItem(
          "@mouthjournal_onboarding_completed",
        );
        setHasCompletedOnboarding(onboarded === "true");
      } catch {
        setHasCompletedOnboarding(false);
      }

      // Load current user
      const user = await AuthService.getCurrentUser();
      if (user) setCurrentUser(user);

      // Load GPS location
      const loc = await LocationService.getCurrentLocation();
      setUserLocation(loc);
    };

    initApp();
  }, []);

  const handleOpenAddLogWithPlace = (place: NearbyPlace) => {
    setSelectedPlaceForLog(place);
    setIsAddLogOpen(true);
  };

  const handleAddLogSuccess = () => {
    setIsAddLogOpen(false);
    setSelectedPlaceForLog(null);
    // Switch ke tab diary agar pengguna langsung melihat hasil input
    setActiveTab("diary");
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
  };

  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@mouthjournal_onboarding_completed", "true");
    } catch {
      // Ignored
    }
    setHasCompletedOnboarding(true);
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  // 1. Tampilkan Splash Screen saat pertama buka
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  // 2. Tampilkan Onboarding Screen jika pengguna baru
  if (hasCompletedOnboarding === false) {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={styles.safeArea}
          edges={["top", "left", "right", "bottom"]}
        >
          <StatusBar style="dark" />
          <OnboardingScreen onComplete={handleCompleteOnboarding} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // 3. Jika belum login, tampilkan layar Auth
  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <AuthModal onSuccess={(u) => setCurrentUser(u)} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const locationTitle = userLocation.district
    ? `${userLocation.district}, ${userLocation.city}`
    : userLocation.city || "Kawasan Sekitar";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar style="dark" />

        {/* Global App Header */}
        <Header
          userAvatar={currentUser.photoURL}
          onProfilePress={() => setActiveTab("profile")}
          onNotificationPress={() => setIsNotificationsOpen(true)}
        />

        {/* Tab Screens View */}
        <View style={styles.screenContainer}>
          {activeTab === "diary" && (
            <DiaryScreen
              userId={currentUser.uid}
              userLocation={userLocation}
              onAddPress={() => {
                setSelectedPlaceForLog(null);
                setIsAddLogOpen(true);
              }}
              onPlaceSelect={(place) => setSelectedPlaceForDetail(place)}
              onJournalSelect={(journal) =>
                setSelectedJournalForDetail(journal)
              }
              onOpenAIRecommendations={() => setIsAIRecommendationsOpen(true)}
            />
          )}

          {activeTab === "explore" && (
            <ExploreScreen
              userLocation={userLocation}
              userId={currentUser.uid}
              onPlaceSelect={(place) => setSelectedPlaceForDetail(place)}
              onAddDiaryForPlace={handleOpenAddLogWithPlace}
            />
          )}

          {activeTab === "wishlist" && (
            <WishlistScreen
              userId={currentUser.uid}
              userLocation={userLocation}
              onPlaceSelect={(place) => setSelectedPlaceForDetail(place)}
              onOpenMap={() => setActiveTab("explore")}
            />
          )}

          {activeTab === "profile" && (
            <ProfileScreen
              user={currentUser}
              onLogout={handleLogout}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onJournalSelect={(journal) =>
                setSelectedJournalForDetail(journal)
              }
              onOpenAIRecommendations={() => setIsAIRecommendationsOpen(true)}
            />
          )}
        </View>

        {/* Bottom Tab Bar with Center (+) Button */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onAddPress={() => {
            setSelectedPlaceForLog(null);
            setIsAddLogOpen(true);
          }}
        />

        {/* Modal Tulis Diary Baru */}
        <Modal
          visible={isAddLogOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsAddLogOpen(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <AddLogScreen
              initialPlace={selectedPlaceForLog}
              userId={currentUser.uid}
              userName={currentUser.displayName}
              onClose={() => {
                setIsAddLogOpen(false);
                setSelectedPlaceForLog(null);
              }}
              onSuccess={handleAddLogSuccess}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Detail Place Page */}
        <Modal
          visible={selectedPlaceForDetail !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedPlaceForDetail(null)}
        >
          {selectedPlaceForDetail && (
            <SafeAreaView
              style={styles.modalSafeArea}
              edges={["top", "left", "right"]}
            >
              <DetailPlaceScreen
                place={selectedPlaceForDetail}
                onBack={() => setSelectedPlaceForDetail(null)}
                onWriteJournal={(place) => {
                  setSelectedPlaceForDetail(null);
                  handleOpenAddLogWithPlace(place);
                }}
              />
            </SafeAreaView>
          )}
        </Modal>

        {/* Modal Detail Journal Page */}
        <Modal
          visible={selectedJournalForDetail !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedJournalForDetail(null)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <DetailJournalScreen
              journal={selectedJournalForDetail}
              onBack={() => setSelectedJournalForDetail(null)}
              onEdit={(j) => {
                setSelectedJournalForDetail(null);
                setEditingJournal(j);
              }}
              onOpenMap={() => {
                setSelectedJournalForDetail(null);
                setActiveTab("explore");
              }}
              onOpenPlaceDetail={() => {
                if (selectedJournalForDetail) {
                  const place: NearbyPlace = {
                    id: selectedJournalForDetail.placeId,
                    name: selectedJournalForDetail.placeName,
                    address: selectedJournalForDetail.placeAddress,
                    mainCategory: selectedJournalForDetail.mainCategory,
                    mainCategoryLabel:
                      selectedJournalForDetail.mainCategory.toUpperCase(),
                    subCategory: selectedJournalForDetail.subCategory,
                    subCategoryLabel: selectedJournalForDetail.subCategoryLabel,
                    latitude: selectedJournalForDetail.latitude,
                    longitude: selectedJournalForDetail.longitude,
                    photoUrl:
                      selectedJournalForDetail.photoUrls &&
                      selectedJournalForDetail.photoUrls.length > 0
                        ? selectedJournalForDetail.photoUrls[0]
                        : undefined,
                    ratingAverage: selectedJournalForDetail.overallRating,
                    cuisine: selectedJournalForDetail.reviewText,
                  };
                  setSelectedJournalForDetail(null);
                  setSelectedPlaceForDetail(place);
                }
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Settings Page */}
        <Modal
          visible={isSettingsOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <SettingsScreen
              onBack={() => setIsSettingsOpen(false)}
              onLogout={() => {
                setIsSettingsOpen(false);
                handleLogout();
              }}
              onShowOnboarding={() => {
                setIsSettingsOpen(false);
                setIsOnboardingModalOpen(true);
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Re-view Onboarding */}
        <Modal
          visible={isOnboardingModalOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsOnboardingModalOpen(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right", "bottom"]}
          >
            <OnboardingScreen
              onComplete={() => setIsOnboardingModalOpen(false)}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Edit Journal */}
        <Modal
          visible={editingJournal !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setEditingJournal(null)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <EditJournalScreen
              journal={editingJournal}
              onBack={() => setEditingJournal(null)}
              onSave={(updatedJournal) => {
                setEditingJournal(null);
                setSelectedJournalForDetail(updatedJournal);
              }}
              onDelete={(_id) => {
                setEditingJournal(null);
                setSelectedJournalForDetail(null);
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Edit Profile */}
        <Modal
          visible={isEditProfileOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsEditProfileOpen(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <EditProfileScreen
              user={currentUser}
              onBack={() => setIsEditProfileOpen(false)}
              onSave={async (updatedProfile) => {
                try {
                  const updated = await AuthService.updateUserProfile(updatedProfile);
                  setCurrentUser(updated);
                } catch {
                  setCurrentUser((prev) => (prev ? { ...prev, ...updatedProfile } : null));
                }
                setIsEditProfileOpen(false);
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal AI Recommendations */}
        <Modal
          visible={isAIRecommendationsOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsAIRecommendationsOpen(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <AIRecommendationsScreen
              onBack={() => setIsAIRecommendationsOpen(false)}
              onPlaceSelect={(place) => {
                setIsAIRecommendationsOpen(false);
                setSelectedPlaceForDetail(place);
              }}
              onOpenItinerary={(_id) => {
                setIsAIRecommendationsOpen(false);
                setActiveTab("explore");
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Modal Notifikasi */}
        <Modal
          visible={isNotificationsOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsNotificationsOpen(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            edges={["top", "left", "right"]}
          >
            <NotificationsScreen
              onBack={() => setIsNotificationsOpen(false)}
              onOpenJournal={async (journalId) => {
                setIsNotificationsOpen(false);
                try {
                  const j = await journalRepository.getJournalById(
                    currentUser.uid,
                    journalId
                  );
                  if (j) {
                    const entry: DiaryEntry = {
                      ...j,
                      userName: j.userName || currentUser.displayName,
                      isPublic: false,
                    };
                    setSelectedJournalForDetail(entry);
                    return;
                  }
                } catch {
                  // Fallback to diary tab
                }
                setActiveTab("diary");
              }}
              onOpenPlace={async (placeId) => {
                setIsNotificationsOpen(false);
                try {
                  const found = await placesService.getPlaceDetails(placeId);
                  if (found) {
                    setSelectedPlaceForDetail(found);
                    return;
                  }
                } catch {
                  // Fallback to explore tab
                }
                setActiveTab("explore");
              }}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
