import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { MouthJournalLogo } from './MouthJournalLogo';
import { theme } from '../config/theme';

interface HeaderProps {
  userAvatar?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onAIPress?: () => void;
  hasUnreadNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  onNotificationPress,
  onProfilePress,
  onAIPress,
  hasUnreadNotifications = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Logo (Horizontal) */}
      <TouchableOpacity activeOpacity={0.85} style={styles.logoTouch}>
        <MouthJournalLogo variant="horizontal" size={34} showTagline={true} />
      </TouchableOpacity>

      {/* Action Right (AI Sparkles, Bell Notification & Avatar) */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={onAIPress}
          activeOpacity={0.7}
        >
          <Sparkles size={17} color="#D04A1E" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Bell size={19} color={theme.colors.coffeeBrown} strokeWidth={2.2} />
          {hasUnreadNotifications && <View style={styles.bellDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.85}
          style={styles.avatarWrapper}
        >
          <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFEB',
  },
  logoTouch: {
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.terracotta,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.cream,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
