import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Application } from '@prisma/client';
import * as applicationRepository from '../repository/application.repository';

@Injectable()
export class CreateApplicationUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
  ) {}

  async execute(userId: string, vacancyId: number): Promise<Application> {
    const vacancy = await this.applicationRepository.findVacancyById(vacancyId);
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

    return this.applicationRepository.create(jobSeeker.id, vacancyId);
  }
}
