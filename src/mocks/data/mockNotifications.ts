import { NotificationItem } from '../../models/notification';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'like',
    title: 'Dian menyukai jurnal kamu',
    message: '"Kopi enak dan suasana nyaman" di Tanamera Coffee Roastery',
    createdAt: hoursAgo(1),
    isRead: false,
    actorName: 'Dian Pratama',
    actorAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80',
    journalId: 'journal-1',
  },
  {
    id: 'notif-2',
    type: 'comment',
    title: 'Raka mengomentari jurnal kamu',
    message: '"Wah jadi pengen ke sini juga, kelihatan enak banget!"',
    createdAt: hoursAgo(3),
    isRead: false,
    actorName: 'Raka Saputra',
    actorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop&q=80',
    journalId: 'journal-2',
  },
  {
    id: 'notif-3',
    type: 'recommendation',
    title: 'Rekomendasi tempat baru untukmu',
    message: 'Suku Coffee cocok dengan selera kamu — suasana cozy & menu pastry enak.',
    createdAt: hoursAgo(6),
    isRead: false,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    placeId: 'place-suku-coffee',
  },
  {
    id: 'notif-4',
    type: 'achievement',
    title: 'Pencapaian baru terbuka!',
    message: 'Kamu meraih badge "Top Reviewer" setelah menulis 25 ulasan. Keren!',
    createdAt: daysAgo(1),
    isRead: true,
  },
  {
    id: 'notif-5',
    type: 'follow',
    title: 'Sari mulai mengikuti kamu',
    message: 'Lihat profil dan jurnal kuliner Sari Wijaya.',
    createdAt: daysAgo(1),
    isRead: true,
    actorName: 'Sari Wijaya',
    actorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'notif-6',
    type: 'like',
    title: 'Budi dan 4 lainnya menyukai jurnal kamu',
    message: '"Pasta truffle nya favorit!" di Pizzeria Cavalese',
    createdAt: daysAgo(2),
    isRead: true,
    actorAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&auto=format&fit=crop&q=80',
    journalId: 'journal-3',
  },
  {
    id: 'notif-7',
    type: 'system',
    title: 'Sudah lama tidak menulis jurnal',
    message: 'Sudah 5 hari nih! Yuk catat pengalaman kuliner terbarumu.',
    createdAt: daysAgo(5),
    isRead: true,
  },
];
