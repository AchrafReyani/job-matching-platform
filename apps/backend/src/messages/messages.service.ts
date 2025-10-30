import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, role: string, dto: CreateMessageDto) {
    const { applicationId, messageText } = dto;

    // Check that application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobSeeker: { include: { user: true } },
        vacancy: { include: { company: { include: { user: true } } } },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'ACCEPTED') {
      throw new ForbiddenException('Chat only available for accepted applications');
    }

    // Verify sender is part of this chat
    const isParticipant =
      application.jobSeeker.user.id === userId ||
      application.vacancy.company.user.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this chat');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        applicationId,
        senderId: userId,
        messageText,
      },
    });

    return message;
  }

  async getMessages(applicationId: number, userId: string) {
    // Ensure user is authorized to view this chat
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobSeeker: { include: { user: true } },
        vacancy: { include: { company: { include: { user: true } } } },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isParticipant =
      application.jobSeeker.user.id === userId ||
      application.vacancy.company.user.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not authorized to view this chat');
    }

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
}
