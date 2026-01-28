import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Optional,
} from "@nestjs/common";
import {
  Application,
  ApplicationStatus,
  NotificationType,
} from "@prisma/client";
import * as applicationRepository from "../repository/application.repository";
import type { NotificationRepository } from "../../notifications/repository/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../../notifications/repository/notification.repository";
import type { UserRepository } from "../../users/repository/user.repository";
import { USER_REPOSITORY } from "../../users/repository/user.repository";

@Injectable()
export class UpdateApplicationStatusUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
    @Optional()
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository?: NotificationRepository,
    @Optional()
    @Inject(USER_REPOSITORY)
    private readonly userRepository?: UserRepository,
  ) {}

  async execute(
    userId: string,
    applicationId: number,
    status: ApplicationStatus,
  ): Promise<Application> {
    const company =
      await this.applicationRepository.findCompanyByUserId(userId);
    if (!company) {
      throw new NotFoundException("Company profile not found");
    }

    const application =
      await this.applicationRepository.findApplicationWithVacancyAndJobSeeker(
        applicationId,
      );
    if (!application) {
      throw new NotFoundException("Application not found");
    }

    if (application.vacancy.companyId !== company.id) {
      throw new ForbiddenException("Not allowed to update this application");
    }

    const updatedApplication = await this.applicationRepository.updateStatus(
      applicationId,
      status,
    );

    // Create notification for job seeker (check preferences first)
    if (this.notificationRepository) {
      const notificationType =
        status === "ACCEPTED"
          ? NotificationType.APPLICATION_ACCEPTED
          : status === "REJECTED"
            ? NotificationType.APPLICATION_REJECTED
            : null;

      if (notificationType) {
        // Check user's notification preferences
        let shouldNotify = true;
        if (this.userRepository) {
          const prefs = await this.userRepository.getNotificationPreferences(
            application.jobSeeker.userId,
          );

          if (status === "ACCEPTED" && prefs.applicationAccepted === false) {
            shouldNotify = false;
          }
          if (status === "REJECTED" && prefs.applicationRejected === false) {
            shouldNotify = false;
          }
        }

        if (shouldNotify) {
          const title =
            status === "ACCEPTED"
              ? "Application Accepted"
              : "Application Rejected";
          const message =
            status === "ACCEPTED"
              ? `Your application to ${application.vacancy.title} at ${application.vacancy.company.companyName} was accepted!`
              : `Your application to ${application.vacancy.title} at ${application.vacancy.company.companyName} was not selected`;

          await this.notificationRepository.create({
            userId: application.jobSeeker.userId,
            type: notificationType,
            title,
            message,
            relatedId: applicationId,
          });
        }
      }
    }

    return updatedApplication;
  }
}
