import { Injectable, Inject } from '@nestjs/common';
import { Notification } from '@prisma/client';
import type {
  NotificationRepository,
  CreateNotificationData,
} from '../repository/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../repository/notification.repository';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(data: CreateNotificationData): Promise<Notification> {
    return this.notificationRepository.create(data);
  }
}
