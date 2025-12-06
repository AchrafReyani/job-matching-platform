export interface Vacancy {
  id: number;
  title: string;
  role: string;
  jobDescription: string;
  salaryRange?: string;
  companyId: number;
  createdAt: string;

  company?: {
    id: number;
    userId: string;
    companyName: string;
  };
}

export interface CreateVacancyPayload {
  title: string;
  role: string;
  jobDescription: string;
  salaryRange?: string;
}

export interface UpdateVacancyPayload {
  title?: string;
  role?: string;
  jobDescription?: string;
  salaryRange?: string;
}
