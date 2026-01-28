import { Injectable, Inject } from "@nestjs/common";
import { Notification } from "@prisma/client";
import type { NotificationRepository } from "../repository/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../repository/notification.repository";

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, limit, offset);
  }
}
