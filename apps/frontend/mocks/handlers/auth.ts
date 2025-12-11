import { http, HttpResponse } from 'msw';
import type { LoginResponse, ProfileResponse, UpdateProfileRequest } from '../../lib/auth/types';

export const authHandlers = [
  http.post('/auth/register/job-seeker', (req) => {
    const body = req.json();
    return HttpResponse.json({ ...body, id: 'user-1' });
  }),

  http.post('/auth/register/company', (req) => {
    const body = req.json();
    return HttpResponse.json({ ...body, id: 'company-1' });
  }),

  http.post('/auth/login', (req) => {
    const body = req.json();
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

  http.put('/auth/profile', (req) => {
    const body: UpdateProfileRequest = req.json();
    return HttpResponse.json({ message: 'Profile updated successfully', ...body });
  }),
];
