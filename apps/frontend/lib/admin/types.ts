export interface AdminStats {
  totalJobSeekers: number;
  totalCompanies: number;
  totalVacancies: number;
  totalApplications: number;
  activeVacancies: number;
  pendingApplications: number;
  newUsersThisWeek: number;
  applicationsThisMonth: number;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface UserDetails {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    name: string;
    websiteUrl?: string | null;
    description?: string | null;
  } | null;
}

export interface VacancyListItem {
  id: number;
  title: string;
  companyName: string;
  role: string;
  applicationCount: number;
  createdAt: string;
}

export interface VacancyDetails {
  id: number;
  title: string;
  salaryRange: string | null;
  role: string;
  jobDescription: string;
  createdAt: string;
  companyId: number;
  companyName: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilter {
  role?: 'JOB_SEEKER' | 'COMPANY';
  search?: string;
  sortBy?: 'createdAt' | 'email' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface VacancyFilter {
  companyId?: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'company';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  websiteUrl?: string;
  description?: string;
}

export interface UpdateVacancyData {
  title?: string;
  salaryRange?: string;
  role?: string;
  jobDescription?: string;
}
