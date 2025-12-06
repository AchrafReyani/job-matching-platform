import { request } from '@/lib/api';
import type { Company, CompanyList } from './types';

/**
 * GET /companies/:id
 * Fetch a single company by numeric ID.
 */
export async function getCompany(id: number): Promise<Company> {
  return request<Company>(`/companies/${id}`, {
    method: 'GET',
  });
}

/**
 * GET /companies
 * Fetch all companies.
 */
export async function getAllCompanies(): Promise<CompanyList> {
  return request<CompanyList>('/companies', {
    method: 'GET',
  });
}
