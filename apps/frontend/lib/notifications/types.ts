export type NotificationType =
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'NEW_MESSAGE'
  | 'NEW_APPLICATION'
  | 'APPLICATION_WITHDRAWN';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  markedCount: number;
}
