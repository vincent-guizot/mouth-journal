import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { EditProfileScreen } from '../../src/screens/EditProfileScreen';
import { useAuth } from '../../src/context/AuthContext';
import { userProfileRepository } from '../../src/repositories';
import { ImageService } from '../../src/services/firebase/imageService';
import { theme } from '../../src/config/theme';

export default function EditProfileRoute() {
  const router = useRouter();
  const { currentUser, updateUser, isLoading } = useAuth();

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
          if (currentUser?.uid) {
            const uploadIfLocal = async (uri?: string, folder: string = 'profile') =>
              uri?.startsWith('file:') || uri?.startsWith('content:')
                ? ImageService.uploadImage(uri, currentUser.uid, folder)
                : uri;
            const profileWithUploadedImages = {
              ...updatedProfile,
              photoURL: await uploadIfLocal(updatedProfile.photoURL, 'avatars'),
              bannerURL: await uploadIfLocal(updatedProfile.bannerURL, 'banners'),
            };
            await userProfileRepository.updateProfile(currentUser.uid, profileWithUploadedImages);
            await updateUser(profileWithUploadedImages);
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
