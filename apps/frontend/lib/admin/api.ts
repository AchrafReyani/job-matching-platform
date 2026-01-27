import { authRequest } from '../api';
import {
  AdminStats,
  UserListItem,
  UserDetails,
  VacancyListItem,
  VacancyDetails,
  PaginatedResult,
  UserFilter,
  VacancyFilter,
  UpdateUserData,
  UpdateVacancyData,
} from './types';

// Dashboard Stats
export async function getAdminStats(): Promise<AdminStats> {
  return authRequest<AdminStats>('/admin/stats');
}

// User Management
export async function getUsers(filter: UserFilter = {}): Promise<PaginatedResult<UserListItem>> {
  const params = new URLSearchParams();
  if (filter.role) params.append('role', filter.role);
  if (filter.search) params.append('search', filter.search);
  if (filter.sortBy) params.append('sortBy', filter.sortBy);
  if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
  if (filter.page) params.append('page', String(filter.page));
  if (filter.pageSize) params.append('pageSize', String(filter.pageSize));

  const queryString = params.toString();
  return authRequest<PaginatedResult<UserListItem>>(`/admin/users${queryString ? `?${queryString}` : ''}`);
}

export async function getUserById(id: string): Promise<UserDetails> {
  return authRequest<UserDetails>(`/admin/users/${id}`);
}

export async function updateUser(id: string, data: UpdateUserData): Promise<void> {
  await authRequest(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await authRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteAllJobSeekers(): Promise<{ count: number }> {
  return authRequest<{ count: number }>('/admin/users/bulk/job-seekers', {
    method: 'DELETE',
  });
}

export async function deleteAllCompanies(): Promise<{ count: number }> {
  return authRequest<{ count: number }>('/admin/users/bulk/companies', {
    method: 'DELETE',
  });
}

// Vacancy Management
export async function getVacancies(filter: VacancyFilter = {}): Promise<PaginatedResult<VacancyListItem>> {
  const params = new URLSearchParams();
  if (filter.companyId) params.append('companyId', String(filter.companyId));
  if (filter.search) params.append('search', filter.search);
  if (filter.sortBy) params.append('sortBy', filter.sortBy);
  if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
  if (filter.page) params.append('page', String(filter.page));
  if (filter.pageSize) params.append('pageSize', String(filter.pageSize));

  const queryString = params.toString();
  return authRequest<PaginatedResult<VacancyListItem>>(`/admin/vacancies${queryString ? `?${queryString}` : ''}`);
}

export async function getVacancyById(id: number): Promise<VacancyDetails> {
  return authRequest<VacancyDetails>(`/admin/vacancies/${id}`);
}

export async function updateVacancy(id: number, data: UpdateVacancyData): Promise<void> {
  await authRequest(`/admin/vacancies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteVacancy(id: number): Promise<void> {
  await authRequest(`/admin/vacancies/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteAllVacancies(): Promise<{ count: number }> {
  return authRequest<{ count: number }>('/admin/vacancies/bulk/all', {
    method: 'DELETE',
  });
}
