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
  createdAt: Date;
}

export interface UserDetails {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
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
  createdAt: Date;
}

export interface VacancyDetails {
  id: number;
  title: string;
  salaryRange: string | null;
  role: string;
  jobDescription: string;
  createdAt: Date;
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

export interface AdminRepository {
  getStats(): Promise<AdminStats>;

  // User management
  getUsers(filter: UserFilter): Promise<PaginatedResult<UserListItem>>;
  getUserById(id: string): Promise<UserDetails | null>;
  updateUser(
    id: string,
    data: { email?: string; name?: string; websiteUrl?: string; description?: string },
  ): Promise<void>;
  deleteUser(id: string, archivedBy: string): Promise<void>;
  deleteAllJobSeekers(archivedBy: string): Promise<number>;
  deleteAllCompanies(archivedBy: string): Promise<number>;

  // Vacancy management
  getVacancies(filter: VacancyFilter): Promise<PaginatedResult<VacancyListItem>>;
  getVacancyById(id: number): Promise<VacancyDetails | null>;
  updateVacancy(
    id: number,
    data: { title?: string; salaryRange?: string; role?: string; jobDescription?: string },
  ): Promise<void>;
  deleteVacancy(id: number, archivedBy: string): Promise<void>;
  deleteAllVacancies(archivedBy: string): Promise<number>;
}

export const ADMIN_REPOSITORY = Symbol('AdminRepository');
