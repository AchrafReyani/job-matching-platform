import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as messageRepository from '../repository/message.repository';

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @Inject(messageRepository.MESSAGE_REPOSITORY)
    private readonly messageRepository: messageRepository.MessageRepository,
  ) {}

  async execute(
    applicationId: number,
    userId: string,
  ): Promise<messageRepository.MessageWithSender[]> {
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
      throw new ForbiddenException('You are not authorized to view this chat');
    }

    return this.messageRepository.findByApplicationId(applicationId);
  }
}
