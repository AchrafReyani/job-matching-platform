import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationStatus } from './dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(jobSeekerId: number, dto: CreateApplicationDto) {
    // Check vacancy exists
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id: dto.vacancyId },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    // Create application
    return this.prisma.application.create({
      data: {
        vacancyId: dto.vacancyId,
        jobSeekerId,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
      },
    });
  }

  async getApplicationsForJobSeeker(jobSeekerId: number) {
    return this.prisma.application.findMany({
      where: { jobSeekerId },
      include: { vacancy: true },
    });
  }

  async getApplicationsForCompany(companyId: number) {
    return this.prisma.application.findMany({
      where: {
        vacancy: { companyId },
      },
      include: { vacancy: true, jobSeeker: true },
    });
  }

  async updateApplication(companyId: number, applicationId: number, dto: UpdateApplicationDto) {
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
      data: dto,
    });
  }
}
