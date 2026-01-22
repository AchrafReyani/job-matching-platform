export interface CompanyPublicInfo {
  id: number;
  companyName: string;
  userId: string;
}

export interface CompanyRepository {
  findById(id: number): Promise<CompanyPublicInfo | null>;
  findAll(): Promise<CompanyPublicInfo[]>;
}

export const COMPANY_REPOSITORY = Symbol('CompanyRepository');
