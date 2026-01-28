import { Injectable } from '@nestjs/common';
import {
  Application,
  ApplicationStatus,
  ArchivedMatch,
  Company,
  JobSeeker,
  Message,
  Vacancy,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  COMPANY_BASIC_SELECT,
  JOB_SEEKER_BASIC_SELECT,
} from '../../common/prisma/select-constants';
import {
  ApplicationRepository,
  ApplicationWithRelations,
  ApplicationWithVacancy,
  ApplicationWithVacancyAndJobSeeker,
  ArchiveMatchData,
  VacancyWithCompany,
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
              select: COMPANY_BASIC_SELECT,
            },
          },
        },
        jobSeeker: {
          select: JOB_SEEKER_BASIC_SELECT,
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
          select: JOB_SEEKER_BASIC_SELECT,
        },
        vacancy: {
          include: {
            company: {
              select: COMPANY_BASIC_SELECT,
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
              select: COMPANY_BASIC_SELECT,
            },
          },
        },
        jobSeeker: {
          select: JOB_SEEKER_BASIC_SELECT,
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

  async findVacancyWithCompanyById(vacancyId: number): Promise<VacancyWithCompany | null> {
    return this.prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        company: {
          select: COMPANY_BASIC_SELECT,
        },
      },
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
              select: COMPANY_BASIC_SELECT,
            },
          },
        },
        jobSeeker: {
          select: JOB_SEEKER_BASIC_SELECT,
        },
      },
    });
  }

  async getMessagesForApplication(applicationId: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { applicationId },
      orderBy: { sentAt: 'asc' },
    });
  }

  async archiveMatch(data: ArchiveMatchData): Promise<ArchivedMatch> {
    return this.prisma.archivedMatch.create({
      data: {
        applicationId: data.applicationId,
        vacancyId: data.vacancyId,
        vacancyTitle: data.vacancyTitle,
        jobSeekerId: data.jobSeekerId,
        jobSeekerName: data.jobSeekerName,
        companyId: data.companyId,
        companyName: data.companyName,
        applicationStatus: data.applicationStatus,
        appliedAt: data.appliedAt,
        messages: data.messages,
        messageCount: data.messageCount,
        deletedBy: data.deletedBy,
        deletedByRole: data.deletedByRole,
      },
    });
  }

  async deleteApplication(id: number): Promise<void> {
    await this.prisma.application.delete({
      where: { id },
    });
  }
}
