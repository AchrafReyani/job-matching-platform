import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { DashboardRepository, CompanyStats } from '../repository/dashboard.repository';
import { DASHBOARD_REPOSITORY } from '../repository/dashboard.repository';

@Injectable()
export class GetCompanyStatsUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async execute(userId: string): Promise<CompanyStats> {
    const company = await this.dashboardRepository.findCompanyByUserId(userId);

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return this.dashboardRepository.getCompanyStats(company.id);
  }
}
