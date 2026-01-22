import { User, JobSeeker, Company, Role } from '@prisma/client';

export type UserWithProfiles = User & {
  jobSeeker: JobSeeker | null;
  company: Company | null;
};

export interface JobSeekerPublicProfile {
  userId: string;
  role: Role;
  profile: {
    fullName: string | undefined;
    portfolioUrl: string | null | undefined;
    experienceSummary: string | null | undefined;
  };
}

export interface CompanyPublicProfile {
  userId: string;
  role: Role;
  profile: {
    companyName: string | undefined;
    websiteUrl: string | null | undefined;
    description: string | null | undefined;
  };
}

export type PublicProfile = JobSeekerPublicProfile | CompanyPublicProfile;

export interface ProfileRepository {
  findUserWithProfiles(userId: string): Promise<UserWithProfiles | null>;
}

export const PROFILE_REPOSITORY = Symbol('ProfileRepository');
