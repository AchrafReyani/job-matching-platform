import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import * as messageRepository from '../repository/message.repository';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(messageRepository.MESSAGE_REPOSITORY)
    private readonly messageRepository: messageRepository.MessageRepository,
  ) {}

  async execute(userId: string, dto: CreateMessageDto): Promise<Message> {
    const { applicationId, messageText } = dto;

    const application =
      await this.messageRepository.findApplicationWithParticipants(
        applicationId,
      );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'ACCEPTED') {
      throw new ForbiddenException(
        'Chat only available for accepted applications',
      );
    }

    const isParticipant =
      application.jobSeeker.user.id === userId ||
      application.vacancy.company.user.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this chat');
    }

    return this.messageRepository.create(applicationId, userId, messageText);
  }
}
