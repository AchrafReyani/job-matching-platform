import { request } from './api';

export interface LoginResponse {
  access_token: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  createdAt: string;
  jobSeeker?: {
    id: number;
    fullName?: string;
    portfolioUrl?: string;
    experienceSummary?: string;
  };
  company?: {
    id: number;
    companyName?: string;
    websiteUrl?: string;
    description?: string;
  };
}

/* ---------- AUTH ENDPOINTS ---------- */

export async function registerJobSeeker(data: {
  email: string;
  password: string;
  fullName: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}) {
  return request('/auth/register/job-seeker', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function registerCompany(data: {
  email: string;
  password: string;
  companyName: string;
  websiteUrl?: string;
  description?: string;
}) {
  return request('/auth/register/company', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  return request('/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProfile(token: string, body: any) {
  return request('/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
