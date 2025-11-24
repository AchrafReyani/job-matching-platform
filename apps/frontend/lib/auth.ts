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

/* ---------- TYPES FOR UPDATE ---------- */

// Only editable fields for job seekers
export interface UpdateJobSeekerProfile {
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

// Only editable fields for companies
export interface UpdateCompanyProfile {
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

// Combined union type — backend will infer from user role
export type UpdateProfileRequest =
  | UpdateJobSeekerProfile
  | UpdateCompanyProfile;

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
  try {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    // Detect the backend 401 error we want to hide
    if (err.message.includes("401")) {
      throw new Error("Invalid email or password.");
    }

    // Everything else gets a generic message
    throw new Error("Something went wrong. Please try again.");
  }
}


export async function getProfile(token: string): Promise<ProfileResponse> {
  return request('/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProfile(
  token: string,
  body: UpdateProfileRequest
): Promise<{ message: string }> {
  return request('/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
