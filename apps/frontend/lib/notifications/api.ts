import { authRequest } from '../api';
import {
  Notification,
  UnreadCountResponse,
  MarkAllReadResponse,
} from './types';

export async function getNotifications(
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  return authRequest<Notification[]>(
    `/notifications?limit=${limit}&offset=${offset}`
  );
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return authRequest<UnreadCountResponse>('/notifications/unread-count');
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  return authRequest<Notification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead(): Promise<MarkAllReadResponse> {
  return authRequest<MarkAllReadResponse>('/notifications/read-all', {
    method: 'PATCH',
  });
}
