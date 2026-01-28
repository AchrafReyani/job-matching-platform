import { Injectable } from '@nestjs/common';
import { User, JobSeeker, Company, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UserManagementRepository,
  UserWithProfiles,
  CreateJobSeekerProfileData,
  CreateCompanyProfileData,
  UpdateJobSeekerProfileData,
  UpdateCompanyProfileData,
} from '../repository/user-management.repository';

@Injectable()
export class PrismaUserManagementRepository
  implements UserManagementRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email: string,
    passwordHash: string,
    role: Role,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
  }

  async createJobSeekerProfile(
    userId: string,
    data: CreateJobSeekerProfileData,
  ): Promise<JobSeeker> {
    return this.prisma.jobSeeker.create({
      data: {
        userId,
        fullName: data.fullName,
        portfolioUrl: data.portfolioUrl,
        experienceSummary: data.experienceSummary,
      },
    });
  }

  async createCompanyProfile(
    userId: string,
    data: CreateCompanyProfileData,
  ): Promise<Company> {
    return this.prisma.company.create({
      data: {
        userId,
        companyName: data.companyName,
        websiteUrl: data.websiteUrl,
        description: data.description,
      },
    });
  }

  async findUserById(userId: string): Promise<UserWithProfiles | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        createdAt: true,
        notificationPreferences: true,
        jobSeeker: {
          select: {
            id: true,
            fullName: true,
            portfolioUrl: true,
            experienceSummary: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
            websiteUrl: true,
            description: true,
          },
        },
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findJobSeekerByUserId(userId: string): Promise<JobSeeker | null> {
    return this.prisma.jobSeeker.findUnique({ where: { userId } });
  }

  async findCompanyByUserId(userId: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { userId } });
  }

  async updateJobSeekerProfile(
    userId: string,
    data: UpdateJobSeekerProfileData,
  ): Promise<JobSeeker> {
    return this.prisma.jobSeeker.update({
      where: { userId },
      data: {
        fullName: data.fullName,
        portfolioUrl: data.portfolioUrl,
        experienceSummary: data.experienceSummary,
      },
    });
  }

  async updateCompanyProfile(
    userId: string,
    data: UpdateCompanyProfileData,
  ): Promise<Company> {
    return this.prisma.company.update({
      where: { userId },
      data: {
        companyName: data.companyName,
        websiteUrl: data.websiteUrl,
        description: data.description,
      },
    });
  }
}
