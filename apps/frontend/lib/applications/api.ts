import { authRequest } from '@/lib/api';
import type {
  Application,
  ApplicationList,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from './types';

/** ---------------- JOB SEEKER ---------------- */

export async function createApplication(
  data: CreateApplicationPayload
): Promise<Application> {
  return authRequest<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyApplications(): Promise<ApplicationList> {
  return authRequest<ApplicationList>('/applications/me', {
    method: 'GET',
  });
}

/** ---------------- COMPANY ---------------- */

export async function getCompanyApplications(): Promise<ApplicationList> {
  return authRequest<ApplicationList>('/applications/company', {
    method: 'GET',
  });
}

export async function updateApplication(
  id: number,
  data: UpdateApplicationPayload
): Promise<Application> {
  return authRequest<Application>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** ---------------- SHARED ---------------- */

export async function getApplicationById(id: number): Promise<Application> {
  return authRequest<Application>(`/applications/details/${id}`, {
    method: 'GET',
  });
}

export async function deleteMatch(
  applicationId: number
): Promise<{ message: string }> {
  return authRequest<{ message: string }>(`/applications/${applicationId}/match`, {
    method: 'DELETE',
  });
}
