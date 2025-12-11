import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Local test data store (tests can reset or override this)
let mockVacancies = [
  {
    id: 1,
    title: 'Software Engineer',
    role: 'Backend',
    jobDescription: 'Build APIs',
    salaryRange: '80k-120k',
    companyId: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    company: {
      id: 10,
      userId: 'user_123',
      companyName: 'TechCorp',
    },
  },
];

const findVacancy = (id: number) =>
  mockVacancies.find((v) => v.id === Number(id));

export const vacanciesHandlers = [
  /* --------------------------- PUBLIC ROUTES --------------------------- */

  http.get(`${API_URL}/vacancies`, () => {
    return HttpResponse.json(mockVacancies);
  }),

  http.get(`${API_URL}/vacancies/:id`, ({ params }) => {
    const vacancy = findVacancy(Number(params.id));
    if (!vacancy) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(vacancy);
  }),

  http.get(`${API_URL}/vacancies/company/:companyId`, ({ params }) => {
    const list = mockVacancies.filter(
      (v) => v.companyId === Number(params.companyId),
    );
    return HttpResponse.json(list);
  }),

  /* --------------------------- AUTH ROUTES --------------------------- */

  http.post(`${API_URL}/vacancies`, async ({ request }) => {
    const body = await request.json();

    const newVacancy = {
      id: mockVacancies.length + 1,
      createdAt: new Date().toISOString(),
      companyId: body.companyId ?? 1,
      ...body,
    };

    mockVacancies.push(newVacancy);
    return HttpResponse.json(newVacancy, { status: 201 });
  }),

  http.patch(`${API_URL}/vacancies/:id`, async ({ params, request }) => {
    const vacancy = findVacancy(Number(params.id));
    if (!vacancy) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const updates = await request.json();
    Object.assign(vacancy, updates);

    return HttpResponse.json(vacancy);
  }),

  http.delete(`${API_URL}/vacancies/:id`, ({ params }) => {
    const id = Number(params.id);
    mockVacancies = mockVacancies.filter((v) => v.id !== id);

    return HttpResponse.json({ success: true });
  }),
];
