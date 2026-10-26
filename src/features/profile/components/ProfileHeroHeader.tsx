import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Settings, Camera, Pencil } from 'lucide-react-native';
import { UserProfile } from '../../../services/firebase/authService';
import { theme } from '../../../config/theme';

interface ProfileHeroHeaderProps {
  user: UserProfile;
  onOpenSettings?: () => void;
  onEditProfile?: () => void;
}

export const ProfileHeroHeader: React.FC<ProfileHeroHeaderProps> = ({
  user,
  onOpenSettings,
  onEditProfile,
}) => {
  return (
    <>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Catatan perjalanan kulinerku</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={onOpenSettings}
          activeOpacity={0.8}
        >
          <Settings size={14} color="#4E2E21" />
          <Text style={styles.settingsBtnText}>Pengaturan</Text>
        </TouchableOpacity>
      </View>

      {/* 2. User Bio Section */}
      <View style={styles.userSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                user.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImage}
          />
          <TouchableOpacity
            style={styles.cameraBadge}
            onPress={onEditProfile}
            activeOpacity={0.85}
          >
            <Camera size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.displayName || 'Vincentia'}</Text>
          <Text style={styles.userHandle}>@{user.username || 'vincentiaa'}</Text>
          <Text style={styles.userBio}>
            {user.bio || 'Menjelajahi rasa, satu tempat dalam satu cerita ☕'}
          </Text>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={onEditProfile}
            activeOpacity={0.8}
          >
            <Pencil size={12} color="#4E2E21" />
            <Text style={styles.editProfileBtnText}>Edit Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 26,
    fontWeight: '800',
    color: '#4E2E21',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    gap: 6,
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E2E21',
  },
  userSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: '#EFE3D3',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.terracotta,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3D2C1E',
  },
  userHandle: {
    fontSize: 13,
    color: theme.colors.terracotta,
    fontWeight: '600',
    marginTop: 2,
  },
  userBio: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 6,
    lineHeight: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    marginTop: 8,
    gap: 6,
  },
  editProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4E2E21',
  },
});
