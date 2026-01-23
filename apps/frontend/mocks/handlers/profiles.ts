import { http, HttpResponse } from 'msw';
import type { ProfileResponse, JobSeekerProfile } from '../../lib/profiles/types';

export const profilesHandlers = [
  http.get('/profiles/:userId', (req) => {
    const { userId } = req.params;

    // Example mock response
    const mockProfile: ProfileResponse = {
      id: userId as string,
      email: 'test@example.com',
      role: 'JOB_SEEKER',
      profile: {
        id: 1,
        fullName: 'John Doe',
        portfolioUrl: 'https://portfolio.example.com',
        experienceSummary: '5 years in software development',
      } as JobSeekerProfile,
    };

    return HttpResponse.json(mockProfile);
  }),
];
