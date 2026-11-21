import React from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { EditProfileScreen } from '../../src/screens/EditProfileScreen';
import { useAuth } from '../../src/context/AuthContext';
import { ImageService, isRemoteImageUrl } from '../../src/services/firebase/imageService';
import { theme } from '../../src/config/theme';

export default function EditProfileRoute() {
  const router = useRouter();
  const { currentUser, updateProfile, isLoading } = useAuth();

  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EditProfileScreen
        user={currentUser}
        onBack={() => router.back()}
        onSave={async (updatedProfile) => {
          // Local picker URIs are uploaded first; a failed/too-large upload throws and
          // nothing is saved (EditProfileScreen shows the error).
          const upload = async (uri: string | undefined, folder: 'avatars' | 'banners') =>
            uri && !isRemoteImageUrl(uri) ? (await ImageService.upload(uri, currentUser.uid, folder)).url : uri;
          const { emailVerificationSentTo } = await updateProfile({
            ...updatedProfile,
            photoURL: await upload(updatedProfile.photoURL, 'avatars'),
            bannerURL: await upload(updatedProfile.bannerURL, 'banners'),
          });
          if (emailVerificationSentTo) {
            Alert.alert(
              'Verifikasi Email',
              `Link verifikasi dikirim ke ${emailVerificationSentTo}. Email akun berubah setelah link dibuka.`
            );
          }
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
