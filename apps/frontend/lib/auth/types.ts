export interface LoginResponse {
  access_token: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  createdAt: string;
  jobSeeker?: {
    id: number;
    fullName?: string;
    portfolioUrl?: string;
    experienceSummary?: string;
  };
  company?: {
    id: number;
    companyName?: string;
    websiteUrl?: string;
    description?: string;
  };
}

export interface UpdateJobSeekerProfile {
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

export interface UpdateCompanyProfile {
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

export type UpdateProfileRequest =
  | UpdateJobSeekerProfile
  | UpdateCompanyProfile;
