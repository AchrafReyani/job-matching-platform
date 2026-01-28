import { Injectable, Inject } from '@nestjs/common';
import type { NotificationRepository } from '../repository/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../repository/notification.repository';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnreadByUserId(userId);
    return { count };
  }
}
