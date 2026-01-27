process.env.TEST_ENV = 'unit';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

import {
  getAdminStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteAllJobSeekers,
  deleteAllCompanies,
  getVacancies,
  getVacancyById,
  updateVacancy,
  deleteVacancy,
  deleteAllVacancies,
} from './api';

type FakeStorage = {
  store: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
};

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn<
  ReturnType<typeof fetch>,
  Parameters<typeof fetch>
>();
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  mockFetch.mockReset();

  const fakeStorage: FakeStorage = {
    store: { token: 'test-admin-token' },
    getItem(key: string) {
      return this.store[key] ?? null;
    },
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    removeItem(key: string) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
    },
    key(index: number) {
      return Object.keys(this.store)[index] ?? null;
    },
    get length() {
      return Object.keys(this.store).length;
    },
  };

  global.localStorage = fakeStorage;

  const dispatchEventMock = jest.fn<boolean, [Event]>(() => true);
  const mockWindow = { dispatchEvent: dispatchEventMock } as unknown as
    Window & typeof globalThis;
  global.window = mockWindow;
});

const createMockResponse = <T,>(
  ok: boolean,
  data: T,
  status = 200
): Response => {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('Admin API - Stats', () => {
  it('getAdminStats fetches stats correctly', async () => {
    const mockStats = {
      totalJobSeekers: 100,
      totalCompanies: 50,
      totalVacancies: 200,
      totalApplications: 500,
      activeVacancies: 180,
      pendingApplications: 120,
      newUsersThisWeek: 15,
      applicationsThisMonth: 80,
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(true, mockStats));

    const result = await getAdminStats();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:3001/admin/stats');
    expect(options?.headers).toBeDefined();
    expect(result).toEqual(mockStats);
  });
});

describe('Admin API - User Management', () => {
  describe('getUsers', () => {
    it('fetches users with default params', async () => {
      const mockResult = {
        data: [{ id: '1', email: 'test@example.com', name: 'Test', role: 'JOB_SEEKER' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockResult));

      const result = await getUsers();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users');
      expect(result.data).toHaveLength(1);
    });

    it('fetches users with filters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { data: [], total: 0 }));

      await getUsers({ role: 'JOB_SEEKER', search: 'alice', page: 2, pageSize: 20 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('role=JOB_SEEKER');
      expect(url).toContain('search=alice');
      expect(url).toContain('page=2');
      expect(url).toContain('pageSize=20');
    });
  });

  describe('getUserById', () => {
    it('fetches user by id', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockUser));

      const result = await getUserById('user-1');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users/user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('sends PATCH request with data', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { message: 'updated' }));

      await updateUser('user-1', { email: 'new@example.com', name: 'New Name' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users/user-1');
      expect(options?.method).toBe('PATCH');
      expect(options?.body).toBe(JSON.stringify({ email: 'new@example.com', name: 'New Name' }));
    });
  });

  describe('deleteUser', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { message: 'deleted' }));

      await deleteUser('user-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users/user-1');
      expect(options?.method).toBe('DELETE');
    });
  });

  describe('deleteAllJobSeekers', () => {
    it('sends DELETE request and returns count', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { count: 5 }));

      const result = await deleteAllJobSeekers();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users/bulk/job-seekers');
      expect(options?.method).toBe('DELETE');
      expect(result.count).toBe(5);
    });
  });

  describe('deleteAllCompanies', () => {
    it('sends DELETE request and returns count', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { count: 3 }));

      const result = await deleteAllCompanies();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/users/bulk/companies');
      expect(options?.method).toBe('DELETE');
      expect(result.count).toBe(3);
    });
  });
});

describe('Admin API - Vacancy Management', () => {
  describe('getVacancies', () => {
    it('fetches vacancies with default params', async () => {
      const mockResult = {
        data: [{ id: 1, title: 'Software Engineer', companyName: 'TechCorp' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockResult));

      const result = await getVacancies();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/vacancies');
      expect(result.data).toHaveLength(1);
    });

    it('fetches vacancies with filters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { data: [], total: 0 }));

      await getVacancies({ companyId: 1, search: 'engineer', page: 2 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('companyId=1');
      expect(url).toContain('search=engineer');
      expect(url).toContain('page=2');
    });
  });

  describe('getVacancyById', () => {
    it('fetches vacancy by id', async () => {
      const mockVacancy = { id: 1, title: 'Software Engineer' };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockVacancy));

      const result = await getVacancyById(1);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/vacancies/1');
      expect(result).toEqual(mockVacancy);
    });
  });

  describe('updateVacancy', () => {
    it('sends PATCH request with data', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { message: 'updated' }));

      await updateVacancy(1, { title: 'New Title', salaryRange: '$100k-$150k' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/vacancies/1');
      expect(options?.method).toBe('PATCH');
      expect(options?.body).toBe(JSON.stringify({ title: 'New Title', salaryRange: '$100k-$150k' }));
    });
  });

  describe('deleteVacancy', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { message: 'deleted' }));

      await deleteVacancy(1);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/vacancies/1');
      expect(options?.method).toBe('DELETE');
    });
  });

  describe('deleteAllVacancies', () => {
    it('sends DELETE request and returns count', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { count: 10 }));

      const result = await deleteAllVacancies();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3001/admin/vacancies/bulk/all');
      expect(options?.method).toBe('DELETE');
      expect(result.count).toBe(10);
    });
  });
});

describe('Error handling', () => {
  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(false, 'Unauthorized', 401));

    await expect(getAdminStats()).rejects.toThrow('API error: 401');
  });

  it('throws on server error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(false, 'Internal Server Error', 500));

    await expect(getUsers()).rejects.toThrow('API error: 500');
  });
});
