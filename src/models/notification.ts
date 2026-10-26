/**
 * 🔔 Notification Domain Model
 */
export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'achievement'
  | 'recommendation'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO 8601
  isRead: boolean;
  actorName?: string;
  actorAvatar?: string;
  thumbnailUrl?: string;
  journalId?: string;
  placeId?: string;
}
