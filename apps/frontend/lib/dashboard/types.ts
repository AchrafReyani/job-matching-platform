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

export type DashboardStats = JobSeekerStats | CompanyStats;
