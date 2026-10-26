import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { EditProfileScreen } from '../../src/screens/EditProfileScreen';
import { useAuth } from '../../src/context/AuthContext';
import { userProfileRepository } from '../../src/repositories';
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
            await userProfileRepository.updateProfile(currentUser.uid, updatedProfile);
            await updateUser(updatedProfile);
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
