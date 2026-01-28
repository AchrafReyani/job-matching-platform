export interface JobSeekerStats {
  pending: number;
  accepted: number;
  rejected: number;
  totalSent: number;
}

export interface CompanyStats {
  activeVacancies: number;
  totalApplicants: number;
  pendingReview: number;
  accepted: number;
  rejected: number;
  newThisWeek: number;
}

export interface DashboardRepository {
  getJobSeekerStats(jobSeekerId: number): Promise<JobSeekerStats>;
  getCompanyStats(companyId: number): Promise<CompanyStats>;
  findJobSeekerByUserId(userId: string): Promise<{ id: number } | null>;
  findCompanyByUserId(userId: string): Promise<{ id: number } | null>;
}

export const DASHBOARD_REPOSITORY = Symbol('DashboardRepository');
