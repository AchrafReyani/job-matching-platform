import { Module } from "@nestjs/common";
import { NotificationsController } from "./controller/notifications.controller";
import { PrismaNotificationRepository } from "./infrastructure/prisma-notification.repository";
import { PrismaService } from "../prisma/prisma.service";
import { NOTIFICATION_REPOSITORY } from "./repository/notification.repository";
import { GetNotificationsUseCase } from "./usecase/get-notifications.usecase";
import { GetUnreadCountUseCase } from "./usecase/get-unread-count.usecase";
import { MarkNotificationReadUseCase } from "./usecase/mark-notification-read.usecase";
import { MarkAllNotificationsReadUseCase } from "./usecase/mark-all-notifications-read.usecase";
import { CreateNotificationUseCase } from "./usecase/create-notification.usecase";

@Module({
  controllers: [NotificationsController],
  providers: [
    PrismaService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    GetNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    CreateNotificationUseCase,
  ],
  exports: [CreateNotificationUseCase, NOTIFICATION_REPOSITORY],
})
export class NotificationsModule {}
