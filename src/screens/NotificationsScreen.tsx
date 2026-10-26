import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SectionList,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  UserPlus,
  Award,
  Sparkles,
  Bell,
  CheckCheck,
} from 'lucide-react-native';
import { theme } from '../config/theme';
import { mockNotifications } from '../mocks/data/mockNotifications';
import { NotificationItem, NotificationType } from '../models/notification';
import { IllustratedState } from '../components/feedback/IllustratedState';

export interface NotificationsScreenProps {
  onBack: () => void;
  onOpenJournal?: (journalId: string) => void;
  onOpenPlace?: (placeId: string) => void;
}

const TYPE_META: Record<
  NotificationType,
  { icon: React.ComponentType<any>; bg: string; iconColor: string }
> = {
  like: { icon: Heart, bg: '#FDE4DC', iconColor: '#D04A1E' },
  comment: { icon: MessageCircle, bg: '#E8F0FE', iconColor: '#3D6FD0' },
  follow: { icon: UserPlus, bg: '#E9F7EF', iconColor: '#1E9E5A' },
  achievement: { icon: Award, bg: '#FDF3E0', iconColor: '#C98A1B' },
  recommendation: { icon: Sparkles, bg: '#FFF4EE', iconColor: '#D04A1E' },
  system: { icon: Bell, bg: '#F0ECE6', iconColor: '#6B3F2E' },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

function groupNotifications(items: NotificationItem[]) {
  const today: NotificationItem[] = [];
  const thisWeek: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  const now = Date.now();
  items.forEach((item) => {
    const ageHours = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) today.push(item);
    else if (ageHours < 24 * 7) thisWeek.push(item);
    else earlier.push(item);
  });

  const sections: { title: string; data: NotificationItem[] }[] = [];
  if (today.length) sections.push({ title: 'Hari Ini', data: today });
  if (thisWeek.length) sections.push({ title: 'Minggu Ini', data: thisWeek });
  if (earlier.length) sections.push({ title: 'Lebih Awal', data: earlier });
  return sections;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenJournal,
  onOpenPlace,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handlePressItem = (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
    if (item.journalId && onOpenJournal) {
      onOpenJournal(item.journalId);
    } else if (item.placeId && onOpenPlace) {
      onOpenPlace(item.placeId);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const meta = TYPE_META[item.type];
    const Icon = meta.icon;

    return (
      <TouchableOpacity
        style={[styles.row, !item.isRead && styles.rowUnread]}
        activeOpacity={0.85}
        onPress={() => handlePressItem(item)}
      >
        {/* Avatar or type icon */}
        {item.actorAvatar ? (
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: item.actorAvatar }} style={styles.avatarImage} />
            <View style={[styles.badgeIcon, { backgroundColor: meta.iconColor }]}>
              <Icon size={10} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
            <Icon size={20} color={meta.iconColor} strokeWidth={2.2} />
          </View>
        )}

        {/* Text content */}
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
        </View>

        {/* Thumbnail or unread dot */}
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          !item.isRead && <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#4E2E21" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifikasi</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
            activeOpacity={0.7}
          >
            <CheckCheck size={14} color={theme.colors.terracotta} />
            <Text style={styles.markAllText}>Tandai Semua</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {sections.length === 0 ? (
        <IllustratedState
          tone="neutral"
          icon={<Bell size={32} color={theme.colors.terracotta} strokeWidth={2} />}
          title="Belum Ada Notifikasi"
          subtitle="Kami akan memberi tahu kamu jika ada aktivitas terbaru."
          style={styles.emptyFill}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFEB',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 18,
    fontWeight: '800',
    color: '#4E2E21',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F5EFEB',
  },
  rowUnread: {
    backgroundColor: '#FFF8F2',
    borderColor: '#FBE4D4',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarWrapper: {
    width: 42,
    height: 42,
    marginRight: 10,
    position: 'relative',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  badgeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C1E',
    lineHeight: 18,
  },
  message: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
    lineHeight: 16,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: theme.colors.terracotta,
    marginTop: 4,
  },
  emptyFill: {
    flex: 1,
  },
});
