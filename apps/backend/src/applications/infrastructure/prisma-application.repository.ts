import { Injectable } from '@nestjs/common';
import {
  Application,
  ApplicationStatus,
  Company,
  JobSeeker,
  Vacancy,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApplicationRepository,
  ApplicationWithRelations,
  ApplicationWithVacancy,
  ApplicationWithVacancyAndJobSeeker,
} from '../repository/application.repository';

@Injectable()
export class PrismaApplicationRepository implements ApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(jobSeekerId: number, vacancyId: number): Promise<Application> {
    return this.prisma.application.create({
      data: {
        vacancyId,
        jobSeekerId,
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });
  }

  async findById(id: number): Promise<Application | null> {
    return this.prisma.application.findUnique({
      where: { id },
    });
  }

  async findByIdWithRelations(
    id: number,
  ): Promise<ApplicationWithRelations | null> {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        vacancy: {
          include: {
            company: {
              select: {
                id: true,
                userId: true,
                companyName: true,
              },
            },
          },
        },
        jobSeeker: {
          select: {
            id: true,
            userId: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findByJobSeekerId(
    jobSeekerId: number,
  ): Promise<ApplicationWithRelations[]> {
    return this.prisma.application.findMany({
      where: { jobSeekerId },
      include: {
        jobSeeker: {
          select: {
            id: true,
            userId: true,
            fullName: true,
          },
        },
        vacancy: {
          include: {
            company: {
              select: {
                id: true,
                userId: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findByCompanyId(
    companyId: number,
  ): Promise<ApplicationWithRelations[]> {
    return this.prisma.application.findMany({
      where: {
        vacancy: { companyId },
      },
      include: {
        vacancy: {
          include: {
            company: {
              select: {
                id: true,
                userId: true,
                companyName: true,
              },
            },
          },
        },
        jobSeeker: {
          select: {
            id: true,
            userId: true,
            fullName: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findExisting(
    jobSeekerId: number,
    vacancyId: number,
  ): Promise<Application | null> {
    return this.prisma.application.findFirst({
      where: {
        jobSeekerId,
        vacancyId,
      },
    });
  }

  async updateStatus(
    id: number,
    status: ApplicationStatus,
  ): Promise<Application> {
    return this.prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async findJobSeekerByUserId(userId: string): Promise<JobSeeker | null> {
    return this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
  }

  async findCompanyByUserId(userId: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { userId },
    });
  }

  async findVacancyById(vacancyId: number): Promise<Vacancy | null> {
    return this.prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });
  }

  async findApplicationWithVacancy(
    applicationId: number,
  ): Promise<ApplicationWithVacancy | null> {
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: true },
    });
  }

  async findApplicationWithVacancyAndJobSeeker(
    applicationId: number,
  ): Promise<ApplicationWithVacancyAndJobSeeker | null> {
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: {
          include: {
            company: {
              select: {
                id: true,
                userId: true,
                companyName: true,
              },
            },
          },
        },
        jobSeeker: {
          select: {
            id: true,
            userId: true,
            fullName: true,
          },
        },
      },
    });
  }
}
