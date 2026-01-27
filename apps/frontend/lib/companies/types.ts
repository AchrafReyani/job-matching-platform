export interface Company {
  id: number;
  companyName: string;
  userId: string;
}

export type CompanyList = Company[];

export interface VacancySummary {
  id: number;
  title: string;
  role: string;
  jobDescription: string;
  salaryRange: string | null;
  createdAt: string;
}

export interface CompanyWithVacancies {
  id: number;
  companyName: string;
  userId: string;
  websiteUrl: string | null;
  description: string | null;
  vacancies: VacancySummary[];
}
