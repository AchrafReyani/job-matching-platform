export type UserRole = 'JOB_SEEKER' | 'COMPANY';

export interface JobSeekerProfile {
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

export interface CompanyProfile {
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

export type ProfilePayload =
  | { role: 'JOB_SEEKER'; profile: JobSeekerProfile }
  | { role: 'COMPANY'; profile: CompanyProfile };

export interface ProfileResponse {
  userId: string;
  role: UserRole;
  profile: JobSeekerProfile | CompanyProfile;
}
