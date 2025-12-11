import {
  createApplication,
  getMyApplications,
  getCompanyApplications,
  updateApplication,
  getApplicationById,
} from './api';
import * as apiUtils from '../api';

process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

const mockFetch = jest.fn();
const originalFetch = global.fetch;
let getTokenSpy: jest.SpyInstance;

beforeAll(() => {
  global.fetch = mockFetch as any;
});

afterAll(() => {
  global.fetch = originalFetch as any;
});

beforeEach(() => {
  mockFetch.mockReset();
  getTokenSpy = jest.spyOn(apiUtils, 'getToken').mockReturnValue('test-token');

  global.localStorage = {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, value: string) { this.store[key] = value; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; },
  };
  localStorage.setItem('token', 'test-token');
  global.window = { dispatchEvent: jest.fn() } as any;
});

afterEach(() => {
  getTokenSpy?.mockRestore();
});

describe('createApplication', () => {
  it('should create a new application', async () => {
    const payload = { vacancyId: 1 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...payload, status: 'APPLIED', appliedAt: new Date().toISOString() }),
    });
    const res = await createApplication(payload);
    expect(res.id).toBe(1);
  });
});

describe('getMyApplications', () => {
  it('should fetch all applications for user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, status: 'APPLIED' }],
    });
    const res = await getMyApplications();
    expect(res.length).toBe(1);
  });
});

describe('getCompanyApplications', () => {
  it('should fetch all applications for company', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, status: 'APPLIED' }],
    });
    const res = await getCompanyApplications();
    expect(res.length).toBe(1);
  });
});

describe('updateApplication', () => {
  it('should update an application', async () => {
    const payload = { status: 'ACCEPTED' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...payload }),
    });
    const res = await updateApplication(1, payload);
    expect(res.status).toBe('ACCEPTED');
  });
});

describe('getApplicationById', () => {
  it('should fetch a single application', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'APPLIED' }),
    });
    const res = await getApplicationById(1);
    expect(res.id).toBe(1);
  });
});
