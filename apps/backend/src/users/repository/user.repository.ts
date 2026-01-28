import { User, Role } from '@prisma/client';
import { NotificationPreferences } from '../dto/update-notification-preferences.dto';

export interface UserRepository {
  create(email: string, passwordHash: string, role: Role): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  getNotificationPreferences(id: string): Promise<NotificationPreferences>;
  updateNotificationPreferences(
    id: string,
    preferences: NotificationPreferences,
  ): Promise<void>;
  deleteUser(id: string, archivedBy: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
