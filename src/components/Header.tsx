import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { theme } from '../config/theme';

interface HeaderProps {
  userAvatar?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasUnreadNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  onNotificationPress,
  onProfilePress,
  hasUnreadNotifications = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand asset supplied with the application. */}
      <TouchableOpacity activeOpacity={0.85} style={styles.logoTouch}>
        <Image source={require('../../assets/Logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.brandText}>
          <Text style={styles.brandName}>MouthJournal</Text>
          <Text style={styles.brandTagline}>FOOD · PLACES · MEMORIES</Text>
        </View>
      </TouchableOpacity>

      {/* Action Right */}
      <View style={styles.rightActions}>
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
    backgroundColor: '#FFFCF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DC',
  },
  logoTouch: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: 42, height: 42 },
  brandText: { marginLeft: 7, justifyContent: 'center' },
  brandName: { fontSize: 17, fontWeight: '800', color: theme.colors.coffeeBrown },
  brandTagline: { marginTop: 1, fontSize: 7, fontWeight: '800', letterSpacing: 1.1, color: theme.colors.terracotta },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
