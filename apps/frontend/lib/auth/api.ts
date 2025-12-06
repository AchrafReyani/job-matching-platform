import { request } from '../api';
import {
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from './types';

// Register job seeker
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

// Register company
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

// Login
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('401')) {
        throw new Error('Invalid email or password.');
      }
      throw new Error('Something went wrong. Please try again.');
    }
    throw new Error('Something went wrong. Please try again.');
  }
}

// Get profile
export async function getProfile(token: string): Promise<ProfileResponse> {
  return request('/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Update profile
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
