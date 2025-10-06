const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface LoginResponse {
  access_token: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  createdAt: string;
  jobSeeker?: any;
  company?: any;
}

/** Utility function to handle JSON + errors cleanly */
async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error: ${res.status} - ${errText}`);
  }

  return res.json();
}

/* ---------- AUTH ---------- */

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

export async function login(data: { email: string; password: string }): Promise<LoginResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
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

/* ---------- HELPER FOR FRONTEND STATE ---------- */

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}
