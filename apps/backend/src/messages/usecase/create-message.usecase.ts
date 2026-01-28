import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Optional,
} from "@nestjs/common";
import { Message, NotificationType } from "@prisma/client";
import * as messageRepository from "../repository/message.repository";
import { CreateMessageDto } from "../dto/create-message.dto";
import type { NotificationRepository } from "../../notifications/repository/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../../notifications/repository/notification.repository";
import type { UserRepository } from "../../users/repository/user.repository";
import { USER_REPOSITORY } from "../../users/repository/user.repository";

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(messageRepository.MESSAGE_REPOSITORY)
    private readonly messageRepository: messageRepository.MessageRepository,
    @Optional()
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository?: NotificationRepository,
    @Optional()
    @Inject(USER_REPOSITORY)
    private readonly userRepository?: UserRepository,
  ) {}

  async execute(userId: string, dto: CreateMessageDto): Promise<Message> {
    const { applicationId, messageText } = dto;

    const application =
      await this.messageRepository.findApplicationWithParticipants(
        applicationId,
      );

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    if (application.status !== "ACCEPTED") {
      throw new ForbiddenException(
        "Chat only available for accepted applications",
      );
    }

    const isParticipant =
      application.jobSeeker.user.id === userId ||
      application.vacancy.company.user.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException("You are not part of this chat");
    }

    const message = await this.messageRepository.create(
      applicationId,
      userId,
      messageText,
    );

    // Send notification to recipient (check preferences first)
    if (this.notificationRepository) {
      const isJobSeeker = application.jobSeeker.user.id === userId;
      const recipientUserId = isJobSeeker
        ? application.vacancy.company.user.id
        : application.jobSeeker.user.id;
      const senderName = isJobSeeker
        ? application.jobSeeker.fullName
        : application.vacancy.company.companyName;

      let shouldNotify = true;
      if (this.userRepository) {
        const prefs =
          await this.userRepository.getNotificationPreferences(recipientUserId);
        if (prefs.newMessages === false) {
          shouldNotify = false;
        }
      }

      if (shouldNotify) {
        await this.notificationRepository.create({
          userId: recipientUserId,
          type: NotificationType.NEW_MESSAGE,
          title: "New Message",
          message: `${senderName} sent you a message`,
          relatedId: applicationId,
        });
      }
    }

    return message;
  }
}
