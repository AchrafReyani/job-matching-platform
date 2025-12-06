export interface JobSeekerProfile {
  id: number;
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

export interface CompanyProfile {
  id: number;
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  profile: JobSeekerProfile | CompanyProfile;
}
