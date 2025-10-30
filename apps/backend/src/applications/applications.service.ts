import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // 🟢 Create new application (Job Seeker applies)
  async createApplication(userId: string, dto: CreateApplicationDto) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id: dto.vacancyId },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job seeker profile not found');

    const existing = await this.prisma.application.findFirst({
      where: {
        jobSeekerId: jobSeeker.id,
        vacancyId: dto.vacancyId,
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this vacancy');
    }

    return this.prisma.application.create({
      data: {
        vacancyId: dto.vacancyId,
        jobSeekerId: jobSeeker.id,
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });
  }

async getApplicationById(id: number) {
  if (!id || isNaN(id)) {
    throw new NotFoundException('Invalid application ID');
  }

  const application = await this.prisma.application.findUnique({
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

  if (!application) throw new NotFoundException('Application not found');
  return application;
}


  // 🟡 Get all applications for a job seeker
  async getApplicationsForJobSeeker(userId: string) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job seeker profile not found');

    return this.prisma.application.findMany({
      where: { jobSeekerId: jobSeeker.id },
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

  // 🟣 Get all applications for a company
  async getApplicationsForCompany(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });
    if (!company) throw new NotFoundException('Company profile not found');

    return this.prisma.application.findMany({
      where: {
        vacancy: { companyId: company.id },
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

  // 🔵 Company updates the application status (ACCEPTED, REJECTED)
  async updateApplication(
    userId: string,
    applicationId: number,
    dto: UpdateApplicationDto,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });
    if (!company) throw new NotFoundException('Company profile not found');

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    if (application.vacancy.companyId !== company.id) {
      throw new ForbiddenException('Not allowed to update this application');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });
  }
}
