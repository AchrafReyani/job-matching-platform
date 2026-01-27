export interface CompanyPublicInfo {
  id: number;
  companyName: string;
  userId: string;
}

export interface VacancySummary {
  id: number;
  title: string;
  salaryRange: string | null;
  role: string;
  jobDescription: string;
  createdAt: Date;
}

export interface CompanyWithVacancies {
  id: number;
  companyName: string;
  userId: string;
  websiteUrl: string | null;
  description: string | null;
  vacancies: VacancySummary[];
}

export interface CompanyRepository {
  findById(id: number): Promise<CompanyPublicInfo | null>;
  findByIdWithVacancies(id: number): Promise<CompanyWithVacancies | null>;
  findAll(): Promise<CompanyPublicInfo[]>;
}

export const COMPANY_REPOSITORY = Symbol('CompanyRepository');
