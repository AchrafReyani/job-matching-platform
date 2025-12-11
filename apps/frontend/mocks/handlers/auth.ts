import { http, HttpResponse } from 'msw';
import type {
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from '../../lib/auth/types';

type RegisterJobSeekerPayload = {
  email: string;
  password: string;
  fullName: string;
  portfolioUrl?: string;
  experienceSummary?: string;
};

type RegisterCompanyPayload = {
  email: string;
  password: string;
  companyName: string;
  websiteUrl?: string;
  description?: string;
};

export const authHandlers = [
  http.post('/auth/register/job-seeker', async (req) => {
    const body = (await req.request.json()) as RegisterJobSeekerPayload;
    return HttpResponse.json({ ...body, id: 'user-1' });
  }),

  http.post('/auth/register/company', async (req) => {
    const body = (await req.request.json()) as RegisterCompanyPayload;
    return HttpResponse.json({ ...body, id: 'company-1' });
  }),

  http.post('/auth/login', async (req) => {
    const body = (await req.request.json()) as { email: string; password: string };
    if (body.email === 'fail@example.com') {
      return HttpResponse.text('Unauthorized', { status: 401 });
    }
    const response: LoginResponse = { access_token: 'mock-token' };
    return HttpResponse.json(response);
  }),

  http.get('/auth/profile', () => {
    const profile: ProfileResponse = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'JOB_SEEKER',
      createdAt: new Date().toISOString(),
      jobSeeker: { id: 1, fullName: 'John Doe' },
    };
    return HttpResponse.json(profile);
  }),

  http.put('/auth/profile', async (req) => {
    const body = (await req.request.json()) as UpdateProfileRequest;
    return HttpResponse.json({ message: 'Profile updated successfully', ...body });
  }),
];
