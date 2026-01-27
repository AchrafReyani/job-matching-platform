import {
  Application,
  Vacancy,
  JobSeeker,
  Company,
  ApplicationStatus,
  Message,
  ArchivedMatch,
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

export type VacancyWithCompany = Vacancy & {
  company: Pick<Company, 'id' | 'userId' | 'companyName'>;
};

export type ApplicationWithVacancyAndJobSeeker = Application & {
  vacancy: Vacancy & {
    company: Pick<Company, 'id' | 'userId' | 'companyName'>;
  };
  jobSeeker: Pick<JobSeeker, 'id' | 'userId' | 'fullName'>;
};

export interface ArchiveMatchData {
  applicationId: number;
  vacancyId: number;
  vacancyTitle: string;
  jobSeekerId: number;
  jobSeekerName: string;
  companyId: number;
  companyName: string;
  applicationStatus: string;
  appliedAt: Date;
  messages: object;
  messageCount: number;
  deletedBy: string;
  deletedByRole: string;
}

export interface ApplicationRepository {
  create(jobSeekerId: number, vacancyId: number): Promise<Application>;
  findById(id: number): Promise<Application | null>;
  findByIdWithRelations(id: number): Promise<ApplicationWithRelations | null>;
  findByJobSeekerId(jobSeekerId: number): Promise<ApplicationWithRelations[]>;
  findByCompanyId(companyId: number): Promise<ApplicationWithRelations[]>;
  findExisting(
    jobSeekerId: number,
    vacancyId: number,
  ): Promise<Application | null>;
  updateStatus(id: number, status: ApplicationStatus): Promise<Application>;
  findJobSeekerByUserId(userId: string): Promise<JobSeeker | null>;
  findCompanyByUserId(userId: string): Promise<Company | null>;
  findVacancyById(vacancyId: number): Promise<Vacancy | null>;
  findVacancyWithCompanyById(vacancyId: number): Promise<VacancyWithCompany | null>;
  findApplicationWithVacancy(
    applicationId: number,
  ): Promise<ApplicationWithVacancy | null>;
  findApplicationWithVacancyAndJobSeeker(
    applicationId: number,
  ): Promise<ApplicationWithVacancyAndJobSeeker | null>;
  getMessagesForApplication(applicationId: number): Promise<Message[]>;
  archiveMatch(data: ArchiveMatchData): Promise<ArchivedMatch>;
  deleteApplication(id: number): Promise<void>;
}

export const APPLICATION_REPOSITORY = Symbol('ApplicationRepository');
