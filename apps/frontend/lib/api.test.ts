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

type FakeStorage = {
  store: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
};

// Mock fetch globally but restore after this suite so MSW suites can use real fetch
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

// Mock localStorage + window before each test
beforeEach(() => {
  mockFetch.mockReset();

  const fakeStorage: FakeStorage = {
    store: {},
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

// Helper to create a mock Response-like object
const createMockResponse = <T,>(
  ok: boolean,
  data: T,
  status = 200
): Response => {
  const body =
    typeof data === 'string' ? data : JSON.stringify(data);
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('request()', () => {
  it('performs a successful JSON request', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(true, { success: true })
    );

    const result = await request('/test');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:3001/test');
    const headers = new Headers(options?.headers ?? {});
    expect(headers.get('Content-Type')).toBe('application/json');

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
    const headers = new Headers(options?.headers ?? {});
    expect(headers.get('Authorization')).toBe('Bearer test-token');
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
