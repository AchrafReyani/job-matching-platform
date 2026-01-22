import { User, JobSeeker, Company, Role } from '@prisma/client';

export type UserWithProfiles = User & {
  jobSeeker: Pick<
    JobSeeker,
    'id' | 'fullName' | 'portfolioUrl' | 'experienceSummary'
  > | null;
  company: Pick<
    Company,
    'id' | 'companyName' | 'websiteUrl' | 'description'
  > | null;
};

export interface CreateJobSeekerProfileData {
  fullName: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

export interface CreateCompanyProfileData {
  companyName: string;
  websiteUrl?: string;
  description?: string;
}

export interface UpdateJobSeekerProfileData {
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

export interface UpdateCompanyProfileData {
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

export interface UserManagementRepository {
  createUser(email: string, passwordHash: string, role: Role): Promise<User>;
  createJobSeekerProfile(
    userId: string,
    data: CreateJobSeekerProfileData,
  ): Promise<JobSeeker>;
  createCompanyProfile(
    userId: string,
    data: CreateCompanyProfileData,
  ): Promise<Company>;
  findUserById(userId: string): Promise<UserWithProfiles | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findJobSeekerByUserId(userId: string): Promise<JobSeeker | null>;
  findCompanyByUserId(userId: string): Promise<Company | null>;
  updateJobSeekerProfile(
    userId: string,
    data: UpdateJobSeekerProfileData,
  ): Promise<JobSeeker>;
  updateCompanyProfile(
    userId: string,
    data: UpdateCompanyProfileData,
  ): Promise<Company>;
}

export const USER_MANAGEMENT_REPOSITORY = Symbol('UserManagementRepository');
