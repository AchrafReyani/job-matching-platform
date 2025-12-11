import {
  getAllVacancies,
  getVacancyById,
  getVacanciesByCompany,
  createVacancy,
  updateVacancy,
  deleteVacancy,
} from './api';

import { server } from '../../mocks/server';

process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// Start MSW server for tests
beforeAll(() => server.listen());
beforeEach(() => {
  // Provide browser-like storage for authRequest
  global.localStorage = {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, value: string) { this.store[key] = value; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; },
  };
  global.window = { dispatchEvent: jest.fn() } as any;
  localStorage.setItem('token', 'test-token');
});
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

describe('Vacancies API', () => {
  // --- PUBLIC ROUTES ---
  it('getAllVacancies() should return all vacancies', async () => {
    const vacancies = await getAllVacancies();
    expect(Array.isArray(vacancies)).toBe(true);
    expect(vacancies.length).toBeGreaterThan(0);
    expect(vacancies[0]).toHaveProperty('id');
    expect(vacancies[0]).toHaveProperty('title');
  });

  it('getVacancyById() should return a single vacancy', async () => {
    const vacancy = await getVacancyById(1);
    expect(vacancy).toHaveProperty('id', 1);
    expect(vacancy).toHaveProperty('title');
  });

  it('getVacanciesByCompany() should return vacancies for a company', async () => {
    const vacancies = await getVacanciesByCompany(10);
    expect(Array.isArray(vacancies)).toBe(true);
    vacancies.forEach((v) => expect(v.companyId).toBe(10));
  });

  it('createVacancy() should create a new vacancy', async () => {
    const payload = {
      title: 'Frontend Dev',
      role: 'Frontend',
      jobDescription: 'React/Next.js',
      salaryRange: '50k-80k',
    };

    const vacancy = await createVacancy(payload);
    expect(vacancy).toMatchObject(payload);
    expect(vacancy).toHaveProperty('id');
  });

  it('updateVacancy() should update an existing vacancy', async () => {
    const updates = { title: 'Updated Title' };
    const vacancy = await updateVacancy(1, updates);
    expect(vacancy).toHaveProperty('id', 1);
    expect(vacancy).toHaveProperty('title', 'Updated Title');
  });

  it('deleteVacancy() should delete a vacancy', async () => {
    const response = await deleteVacancy(1);
    expect(response).toEqual({ success: true });

    // Confirm deletion
    await expect(getVacancyById(1)).rejects.toThrow();
  });

  // --- ERROR HANDLING ---
  it('getVacancyById() should throw 404 for non-existing vacancy', async () => {
    await expect(getVacancyById(999)).rejects.toThrow();
  });
});
