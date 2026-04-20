export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type?: NotificationType;
  isRead?: boolean;
  relatedId?: number;
}
