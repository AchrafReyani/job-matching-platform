import {
  Application,
  Vacancy,
  JobSeeker,
  Company,
  ApplicationStatus,
} from '@prisma/client';

export type ApplicationWithRelations = Application & {
  vacancy: Vacancy & {
    company: Pick<Company, 'id' | 'userId' | 'companyName'>;
  };
  jobSeeker: Pick<JobSeeker, 'id' | 'userId' | 'fullName'>;
};

export type ApplicationWithVacancy = Application & {
  vacancy: Vacancy;
};

export interface ApplicationRepository {
  create(jobSeekerId: number, vacancyId: number): Promise<Application>;
  findById(id: number): Promise<Application | null>;
  findByIdWithRelations(id: number): Promise<ApplicationWithRelations | null>;
  findByJobSeekerId(jobSeekerId: number): Promise<ApplicationWithRelations[]>;
  findByCompanyId(companyId: number): Promise<ApplicationWithRelations[]>;
  findExisting(jobSeekerId: number, vacancyId: number): Promise<Application | null>;
  updateStatus(id: number, status: ApplicationStatus): Promise<Application>;
  findJobSeekerByUserId(userId: string): Promise<JobSeeker | null>;
  findCompanyByUserId(userId: string): Promise<Company | null>;
  findVacancyById(vacancyId: number): Promise<Vacancy | null>;
  findApplicationWithVacancy(applicationId: number): Promise<ApplicationWithVacancy | null>;
}

export const APPLICATION_REPOSITORY = Symbol('ApplicationRepository');
