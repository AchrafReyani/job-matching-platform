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
let getTokenSpy: jest.SpyInstance;

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  mockFetch.mockReset();
  getTokenSpy = jest.spyOn(apiUtils, 'getToken').mockReturnValue('test-token');

  const fakeStorage: FakeStorage = {
    store: {},
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, value: string) { this.store[key] = value; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; },
    key(index: number) { return Object.keys(this.store)[index] ?? null; },
    get length() { return Object.keys(this.store).length; },
  };
  global.localStorage = fakeStorage;
  localStorage.setItem('token', 'test-token');
  const dispatchEventMock = jest.fn<(event: Event) => boolean>(() => true);
  const mockWindow = { dispatchEvent: dispatchEventMock } as unknown as
    Window & typeof globalThis;
  global.window = mockWindow;
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
