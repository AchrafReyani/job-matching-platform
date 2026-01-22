import { Module } from '@nestjs/common';
import { MessagesController } from './controller/messages.controller';
import { PrismaMessageRepository } from './infrastructure/prisma-message.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGE_REPOSITORY } from './repository/message.repository';
import { CreateMessageUseCase } from './usecase/create-message.usecase';
import { GetMessagesUseCase } from './usecase/get-messages.usecase';

@Module({
  controllers: [MessagesController],
  providers: [
    PrismaService,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
    CreateMessageUseCase,
    GetMessagesUseCase,
  ],
})
export class MessagesModule {}
