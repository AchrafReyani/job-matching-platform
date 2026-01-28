import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Notification } from "@prisma/client";
import type { NotificationRepository } from "../repository/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../repository/notification.repository";

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string, notificationId: number): Promise<Notification> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException("Not allowed to access this notification");
    }

    return this.notificationRepository.markAsRead(notificationId);
  }
}
