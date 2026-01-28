import { Module } from "@nestjs/common";
import { MessagesController } from "./controller/messages.controller";
import { PrismaMessageRepository } from "./infrastructure/prisma-message.repository";
import { PrismaService } from "../prisma/prisma.service";
import { MESSAGE_REPOSITORY } from "./repository/message.repository";
import { CreateMessageUseCase } from "./usecase/create-message.usecase";
import { GetMessagesUseCase } from "./usecase/get-messages.usecase";
import { GetConversationsUseCase } from "./usecase/get-conversations.usecase";
import { MarkMessagesReadUseCase } from "./usecase/mark-messages-read.usecase";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaUserRepository } from "../users/infrastructure/prisma-user.repository";
import { USER_REPOSITORY } from "../users/repository/user.repository";

@Module({
  imports: [NotificationsModule],
  controllers: [MessagesController],
  providers: [
    PrismaService,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateMessageUseCase,
    GetMessagesUseCase,
    GetConversationsUseCase,
    MarkMessagesReadUseCase,
  ],
})
export class MessagesModule {}
