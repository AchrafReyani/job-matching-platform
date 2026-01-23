import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MessageRepository,
  MessageWithSender,
  ApplicationWithParticipants,
  ConversationSummary,
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

  async findByApplicationId(
    applicationId: number,
  ): Promise<MessageWithSender[]> {
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

  async markMessagesAsRead(
    applicationId: number,
    readerId: string,
  ): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: {
        applicationId,
        senderId: { not: readerId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async getConversationsWithUnreadCount(
    userId: string,
  ): Promise<ConversationSummary[]> {
    // Get the user's role to determine which applications to fetch
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    if (!user) {
      return [];
    }

    // Find all accepted applications for this user
    const applications = await this.prisma.application.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { jobSeeker: { userId } },
          { vacancy: { company: { userId } } },
        ],
      },
      include: {
        jobSeeker: { include: { user: true } },
        vacancy: { include: { company: { include: { user: true } } } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });

    // Build conversation summaries with unread counts
    const summaries: ConversationSummary[] = await Promise.all(
      applications.map(async (app) => {
        const isJobSeeker = app.jobSeeker.userId === userId;
        const otherPartyName = isJobSeeker
          ? app.vacancy.company.companyName
          : app.jobSeeker.fullName;
        const otherPartyUserId = isJobSeeker
          ? app.vacancy.company.userId
          : app.jobSeeker.userId;

        // Count unread messages (messages not sent by this user that haven't been read)
        const unreadCount = await this.prisma.message.count({
          where: {
            applicationId: app.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        const lastMessage = app.messages[0] || null;

        return {
          applicationId: app.id,
          vacancyTitle: app.vacancy.title,
          otherPartyName,
          otherPartyUserId,
          lastMessageText: lastMessage?.messageText || null,
          lastMessageAt: lastMessage?.sentAt || null,
          unreadCount,
        };
      }),
    );

    // Sort by last message time (most recent first), with conversations without messages at the end
    return summaries.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });
  }
}
