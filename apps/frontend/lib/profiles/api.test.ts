import { getProfile } from './api';
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

const createJsonResponse = <T,>(data: T, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

// Mock localStorage for auth token
beforeEach(() => {
  mockFetch.mockReset();
  getTokenSpy = jest.spyOn(apiUtils, 'getToken').mockReturnValue('test-token');

  const fakeStorage: FakeStorage = {
    store: {},
    getItem(key: string) {
      return this.store[key] || null;
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
  localStorage.setItem('token', 'test-token');
  const dispatchEventMock = jest.fn<boolean, [Event]>(() => true);
  const mockWindow = { dispatchEvent: dispatchEventMock } as unknown as
    Window & typeof globalThis;
  global.window = mockWindow;
});

afterEach(() => {
  getTokenSpy?.mockRestore();
});

describe('profiles API', () => {
  it('should fetch a user profile successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createJsonResponse({
        id: '123',
        profile: { fullName: 'Test User' },
      })
    );

    const profile = await getProfile('123');

    expect(profile).toBeDefined();
    expect(profile.id).toBe('123');
    expect(profile.profile).toHaveProperty('fullName');
  });

  it('should throw error if no auth token', async () => {
    localStorage.clear();

    await expect(getProfile('123')).rejects.toThrow('No auth token found');
  });
});
