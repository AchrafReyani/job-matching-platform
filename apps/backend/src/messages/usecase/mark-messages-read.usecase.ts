import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as messageRepository from '../repository/message.repository';

@Injectable()
export class MarkMessagesReadUseCase {
  constructor(
    @Inject(messageRepository.MESSAGE_REPOSITORY)
    private readonly messageRepository: messageRepository.MessageRepository,
  ) {}

  async execute(applicationId: number, userId: string): Promise<number> {
    const application =
      await this.messageRepository.findApplicationWithParticipants(
        applicationId,
      );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isParticipant =
      application.jobSeeker.user.id === userId ||
      application.vacancy.company.user.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not authorized to access this chat',
      );
    }

    return this.messageRepository.markMessagesAsRead(applicationId, userId);
  }
}
