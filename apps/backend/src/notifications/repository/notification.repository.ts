import { Notification, NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;
  findById(id: number): Promise<Notification | null>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsReadByUserId(userId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository');
