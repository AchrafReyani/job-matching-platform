import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MessageRepository,
  MessageWithSender,
  ApplicationWithParticipants,
} from '../repository/message.repository';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    applicationId: number,
    senderId: string,
    messageText: string,
  ): Promise<Message> {
    return this.prisma.message.create({
      data: {
        applicationId,
        senderId,
        messageText,
      },
    });
  }

  async findByApplicationId(applicationId: number): Promise<MessageWithSender[]> {
    return this.prisma.message.findMany({
      where: { applicationId },
      orderBy: { sentAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findApplicationWithParticipants(
    applicationId: number,
  ): Promise<ApplicationWithParticipants | null> {
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobSeeker: { include: { user: true } },
        vacancy: { include: { company: { include: { user: true } } } },
      },
    });
  }
}
