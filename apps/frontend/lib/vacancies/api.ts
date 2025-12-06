import { request, authRequest } from '@/lib/api';
import type {
  Vacancy,
  CreateVacancyPayload,
  UpdateVacancyPayload,
} from './types';

/* --------------------- PUBLIC ROUTES --------------------- */

// GET /vacancies
export function getAllVacancies(): Promise<Vacancy[]> {
  return request<Vacancy[]>('/vacancies');
}

// GET /vacancies/:id
export function getVacancyById(id: number): Promise<Vacancy> {
  return request<Vacancy>(`/vacancies/${id}`);
}

// GET /vacancies/company/:companyId
export function getVacanciesByCompany(companyId: number): Promise<Vacancy[]> {
  return request<Vacancy[]>(`/vacancies/company/${companyId}`);
}

/* --------------------- AUTH ROUTES (COMPANY ONLY) --------------------- */

// POST /vacancies
export function createVacancy(data: CreateVacancyPayload): Promise<Vacancy> {
  return authRequest<Vacancy>('/vacancies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PATCH /vacancies/:id
export function updateVacancy(
  id: number,
  data: UpdateVacancyPayload,
): Promise<Vacancy> {
  return authRequest<Vacancy>(`/vacancies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// DELETE /vacancies/:id
export function deleteVacancy(id: number): Promise<{ success: true }> {
  return authRequest<{ success: true }>(`/vacancies/${id}`, {
    method: 'DELETE',
  });
}
