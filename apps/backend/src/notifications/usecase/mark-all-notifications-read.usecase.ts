import { Injectable, Inject } from '@nestjs/common';
import type { NotificationRepository } from '../repository/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../repository/notification.repository';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<{ markedCount: number }> {
    const markedCount =
      await this.notificationRepository.markAllAsReadByUserId(userId);
    return { markedCount };
  }
}
