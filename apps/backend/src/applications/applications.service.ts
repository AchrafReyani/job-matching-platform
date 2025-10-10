import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Job seeker applies for a vacancy
  async createApplication(jobSeekerId: number, dto: CreateApplicationDto) {
    // Check vacancy exists
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id: dto.vacancyId },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    // Create application with string literal status
    return this.prisma.application.create({
      data: {
        vacancyId: dto.vacancyId,
        jobSeekerId,
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });
  }

  // List applications for a job seeker
  async getApplicationsForJobSeeker(jobSeekerId: number) {
    return this.prisma.application.findMany({
      where: { jobSeekerId },
      include: { vacancy: true },
    });
  }

  // List applications for a company (all vacancies they posted)
  async getApplicationsForCompany(companyId: number) {
    return this.prisma.application.findMany({
      where: {
        vacancy: { companyId },
      },
      include: { vacancy: true, jobSeeker: true },
    });
  }

  // Company updates the status of an application
  async updateApplication(
    companyId: number,
    applicationId: number,
    dto: UpdateApplicationDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    // Only company owning the vacancy can update
    if (application.vacancy.companyId !== companyId) {
      throw new ForbiddenException('Not allowed to update this application');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status, // literal string 'APPLIED' | 'ACCEPTED' | 'REJECTED'
      },
    });
  }
}
