import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardRepository,
  JobSeekerStats,
  CompanyStats,
} from '../repository/dashboard.repository';

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findJobSeekerByUserId(userId: string): Promise<{ id: number } | null> {
    return this.prisma.jobSeeker.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async findCompanyByUserId(userId: string): Promise<{ id: number } | null> {
    return this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async getJobSeekerStats(jobSeekerId: number): Promise<JobSeekerStats> {
    const [pending, accepted, rejected, totalSent] = await Promise.all([
      this.prisma.application.count({
        where: { jobSeekerId, status: 'APPLIED' },
      }),
      this.prisma.application.count({
        where: { jobSeekerId, status: 'ACCEPTED' },
      }),
      this.prisma.application.count({
        where: { jobSeekerId, status: 'REJECTED' },
      }),
      this.prisma.application.count({
        where: { jobSeekerId },
      }),
    ]);

    return { pending, accepted, rejected, totalSent };
  }

  async getCompanyStats(companyId: number): Promise<CompanyStats> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all vacancy IDs for this company
    const vacancies = await this.prisma.vacancy.findMany({
      where: { companyId },
      select: { id: true },
    });

    const vacancyIds = vacancies.map((v) => v.id);

    const [
      activeVacancies,
      totalApplicants,
      pendingReview,
      accepted,
      rejected,
      newThisWeek,
    ] = await Promise.all([
      this.prisma.vacancy.count({
        where: { companyId },
      }),
      this.prisma.application.count({
        where: { vacancyId: { in: vacancyIds } },
      }),
      this.prisma.application.count({
        where: { vacancyId: { in: vacancyIds }, status: 'APPLIED' },
      }),
      this.prisma.application.count({
        where: { vacancyId: { in: vacancyIds }, status: 'ACCEPTED' },
      }),
      this.prisma.application.count({
        where: { vacancyId: { in: vacancyIds }, status: 'REJECTED' },
      }),
      this.prisma.application.count({
        where: {
          vacancyId: { in: vacancyIds },
          appliedAt: { gte: oneWeekAgo },
        },
      }),
    ]);

    return {
      activeVacancies,
      totalApplicants,
      pendingReview,
      accepted,
      rejected,
      newThisWeek,
    };
  }
}
