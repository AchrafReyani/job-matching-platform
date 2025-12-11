process.env.TEST_ENV = 'unit';

// Inject env variable before imports
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

import {
  request,
  authRequest,
  saveToken,
  getToken,
  clearToken,
} from './api';

// Mock fetch globally but restore after this suite so MSW suites can use real fetch
const mockFetch = jest.fn();
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = mockFetch as any;
});

afterAll(() => {
  global.fetch = originalFetch as any;
});

// Mock localStorage + window before each test
beforeEach(() => {
  mockFetch.mockReset();

  // @ts-ignore override
  global.localStorage = {
    store: {} as Record<string, string>,
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
  };

  // @ts-ignore override
  global.window = {
    dispatchEvent: jest.fn(),
  } as any;
});

// Helper to create a mock Response-like object
const createMockResponse = (ok: boolean, data: any, status = 200) => ({
  ok,
  status,
  json: async () => data,
  text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
});

describe('request()', () => {
  it('performs a successful JSON request', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(true, { success: true })
    );

    const result = await request('/test');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:3001/test');
    expect(options?.headers?.['Content-Type']).toBe('application/json');

    expect(result).toEqual({ success: true });
  });

  it('throws when API returns error', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(false, 'Bad Request', 400)
    );

    await expect(request('/fail')).rejects.toThrow(
      'API error: 400 - Bad Request'
    );
  });
});

describe('authRequest()', () => {
  it('throws if no token exists', async () => {
    expect(getToken()).toBe(null);
    await expect(authRequest('/test')).rejects.toThrow('No auth token found');
  });

  it('includes Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token');

    mockFetch.mockResolvedValueOnce(
      createMockResponse(true, { ok: true })
    );

    await authRequest('/secure');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer test-token');
  });
});

describe('token helpers', () => {
  it('saveToken() stores token & dispatches event', () => {
    saveToken('abc123');

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('getToken() returns stored token', () => {
    localStorage.setItem('token', 'xyz');
    expect(getToken()).toBe('xyz');
  });

  it('clearToken() removes token & dispatches event', () => {
    localStorage.setItem('token', 'remove-me');

    clearToken();

    expect(localStorage.getItem('token')).toBe(null);
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
});
