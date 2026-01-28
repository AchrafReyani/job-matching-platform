import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  DashboardRepository,
  JobSeekerStats,
} from '../repository/dashboard.repository';
import { DASHBOARD_REPOSITORY } from '../repository/dashboard.repository';

@Injectable()
export class GetJobSeekerStatsUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async execute(userId: string): Promise<JobSeekerStats> {
    const jobSeeker =
      await this.dashboardRepository.findJobSeekerByUserId(userId);

    if (!jobSeeker) {
      throw new NotFoundException('Job seeker profile not found');
    }

    return this.dashboardRepository.getJobSeekerStats(jobSeeker.id);
  }
}
