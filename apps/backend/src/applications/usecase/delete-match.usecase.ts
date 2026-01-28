import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import * as applicationRepository from "../repository/application.repository";
import type { NotificationRepository } from "../../notifications/repository/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../../notifications/repository/notification.repository";

@Injectable()
export class DeleteMatchUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string, applicationId: number): Promise<void> {
    // Get user profiles
    const jobSeeker =
      await this.applicationRepository.findJobSeekerByUserId(userId);
    const company =
      await this.applicationRepository.findCompanyByUserId(userId);

    // Find the application with all relations
    const application =
      await this.applicationRepository.findApplicationWithVacancyAndJobSeeker(
        applicationId,
      );

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    // Only ACCEPTED applications can be deleted as matches
    if (application.status !== "ACCEPTED") {
      throw new BadRequestException(
        "Only accepted applications can be deleted as matches",
      );
    }

    // Check authorization
    const isJobSeekerOwner =
      jobSeeker && jobSeeker.id === application.jobSeekerId;
    const isCompanyOwner =
      company && company.id === application.vacancy.companyId;

    if (!isJobSeekerOwner && !isCompanyOwner) {
      throw new ForbiddenException("Not authorized to delete this match");
    }

    // Determine who is deleting and who should be notified
    const deletedByRole = isJobSeekerOwner ? "JOB_SEEKER" : "COMPANY";
    const notifyUserId = isJobSeekerOwner
      ? application.vacancy.company.userId
      : application.jobSeeker.userId;
    const deletedByName = isJobSeekerOwner
      ? application.jobSeeker.fullName
      : application.vacancy.company.companyName;

    // Get messages for archiving
    const messages =
      await this.applicationRepository.getMessagesForApplication(applicationId);

    // Archive the match
    await this.applicationRepository.archiveMatch({
      applicationId: application.id,
      vacancyId: application.vacancy.id,
      vacancyTitle: application.vacancy.title,
      jobSeekerId: application.jobSeeker.id,
      jobSeekerName: application.jobSeeker.fullName,
      companyId: application.vacancy.companyId,
      companyName: application.vacancy.company.companyName,
      applicationStatus: application.status,
      appliedAt: application.appliedAt,
      messages: messages,
      messageCount: messages.length,
      deletedBy: userId,
      deletedByRole,
    });

    // Delete the application (cascades to messages)
    await this.applicationRepository.deleteApplication(applicationId);

    // Notify the other party
    await this.notificationRepository.create({
      userId: notifyUserId,
      type: NotificationType.MATCH_ENDED,
      title: "Match Ended",
      message: `${deletedByName} has ended the conversation about ${application.vacancy.title}`,
      relatedId: applicationId,
    });
  }
}
