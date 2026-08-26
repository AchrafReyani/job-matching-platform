import { request, authRequest } from '../api';
import {
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from './types';

/* ---------------------------------------------
   REGISTER (Public Endpoints)
---------------------------------------------- */

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

/* ---------------------------------------------
   LOGIN (Public)
---------------------------------------------- */

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

/* ---------------------------------------------
   LINE LOGIN (via renkei, brokered by the backend)
---------------------------------------------- */

export type LineSignupRole = 'job-seeker' | 'company';

/**
 * Where the browser goes to start a LINE login. The backend redirects to
 * renkei -> LINE -> back to the backend, which finally lands on
 * /login/line#token=... on this site. The role only matters for first-time
 * LINE users; existing accounts keep their stored role.
 */
export function lineLoginUrl(role: LineSignupRole): string {
  const base = process.env.NEXT_PUBLIC_API_URL as string;
  return `${base}/auth/line/start?role=${role}`;
}

/** Reads the access token the backend put in the URL fragment after a LINE login. */
export function readTokenFromFragment(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const token = params.get('token');
  return token && token.length > 0 ? token : null;
}

/* ---------------------------------------------
   PROFILE (Protected — now uses authRequest)
---------------------------------------------- */

// Get the logged-in user's profile
export async function getProfile(): Promise<ProfileResponse> {
  return authRequest<ProfileResponse>('/auth/profile', {
    method: 'GET',
  });
}

// Update logged-in user's profile
export async function updateProfile(
  body: UpdateProfileRequest
): Promise<{ message: string }> {
  return authRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
