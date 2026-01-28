import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import { Application, NotificationType } from '@prisma/client';
import * as applicationRepository from '../repository/application.repository';
import type { NotificationRepository } from '../../notifications/repository/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../notifications/repository/notification.repository';
import type { UserRepository } from '../../users/repository/user.repository';
import { USER_REPOSITORY } from '../../users/repository/user.repository';

@Injectable()
export class CreateApplicationUseCase {
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

  async execute(userId: string, vacancyId: number): Promise<Application> {
    const vacancy =
      await this.applicationRepository.findVacancyWithCompanyById(vacancyId);
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    const jobSeeker =
      await this.applicationRepository.findJobSeekerByUserId(userId);
    if (!jobSeeker) {
      throw new NotFoundException('Job seeker profile not found');
    }

    const existing = await this.applicationRepository.findExisting(
      jobSeeker.id,
      vacancyId,
    );
    if (existing) {
      throw new ConflictException('You have already applied to this vacancy');
    }

    const application = await this.applicationRepository.create(
      jobSeeker.id,
      vacancyId,
    );

    // Send notification to company (check preferences first)
    if (this.notificationRepository && vacancy.company?.userId) {
      let shouldNotify = true;
      if (this.userRepository) {
        const prefs = await this.userRepository.getNotificationPreferences(
          vacancy.company.userId,
        );
        if (prefs.newApplications === false) {
          shouldNotify = false;
        }
      }

      if (shouldNotify) {
        await this.notificationRepository.create({
          userId: vacancy.company.userId,
          type: NotificationType.NEW_APPLICATION,
          title: 'New Application',
          message: `${jobSeeker.fullName} applied to ${vacancy.title}`,
          relatedId: application.id,
        });
      }
    }

    return application;
  }
}
