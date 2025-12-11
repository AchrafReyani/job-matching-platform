import { getProfile } from './api';
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

// Mock localStorage for auth token
beforeEach(() => {
  mockFetch.mockReset();
  getTokenSpy = jest.spyOn(apiUtils, 'getToken').mockReturnValue('test-token');

  // @ts-ignore
  global.localStorage = {
    store: {} as Record<string, string>,
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
  };
  localStorage.setItem('token', 'test-token');
  // @ts-ignore
  global.window = { dispatchEvent: jest.fn() };
});

afterEach(() => {
  getTokenSpy?.mockRestore();
});

describe('profiles API', () => {
  it('should fetch a user profile successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        profile: { fullName: 'Test User' },
      }),
    });

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
