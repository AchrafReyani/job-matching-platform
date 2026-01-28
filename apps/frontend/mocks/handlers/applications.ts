import { http, HttpResponse } from 'msw';
import type {
  Application,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from '../../lib/applications/types';

const mockApplications: Application[] = [
  {
    id: 1,
    status: 'APPLIED',
    appliedAt: new Date().toISOString(),
    vacancy: { id: 1, title: 'Dev', company: { id: 1, userId: 'u1', companyName: 'Acme' } },
    jobSeeker: { id: 1, userId: 'js1', fullName: 'John Doe' },
  },
];

export const applicationsHandlers = [
  http.post('/applications', async (req) => {
    const body = (await req.request.json()) as CreateApplicationPayload;
    const newApp: Application = {
      id: mockApplications.length + 1,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      vacancy: { id: body.vacancyId, title: 'Vacancy', company: { id: 1, userId: 'u1', companyName: 'Acme' } },
      jobSeeker: { id: 1, userId: 'js1', fullName: 'John Doe' },
    };
    mockApplications.push(newApp);
    return HttpResponse.json(newApp);
  }),

  http.get('/applications/me', () => {
    return HttpResponse.json(mockApplications);
  }),

  http.get('/applications/company', () => {
    return HttpResponse.json(mockApplications);
  }),

  http.patch('/applications/:id', async (req) => {
    const id = Number(req.params.id);
    const body = (await req.request.json()) as UpdateApplicationPayload;
    const app = mockApplications.find((a) => a.id === id);
    if (app) {
      Object.assign(app, body);
      return HttpResponse.json(app);
    }
    return HttpResponse.text('Not Found', { status: 404 });
  }),

  http.get('/applications/details/:id', (req) => {
    const id = Number(req.params.id);
    const app = mockApplications.find((a) => a.id === id);
    if (app) return HttpResponse.json(app);
    return HttpResponse.text('Not Found', { status: 404 });
  }),
];
