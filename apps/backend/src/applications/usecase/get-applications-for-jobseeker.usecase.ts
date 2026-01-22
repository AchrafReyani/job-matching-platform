import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';

@Injectable()
export class GetApplicationsForJobSeekerUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<applicationRepository.ApplicationWithRelations[]> {
    const jobSeeker =
      await this.applicationRepository.findJobSeekerByUserId(userId);
    if (!jobSeeker) {
      throw new NotFoundException('Job seeker profile not found');
    }

    return this.applicationRepository.findByJobSeekerId(jobSeeker.id);
  }
}
