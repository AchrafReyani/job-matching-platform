import {
  registerJobSeeker,
  registerCompany,
  login,
  getProfile,
  updateProfile,
} from './api';

process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

const mockFetch = jest.fn();
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = mockFetch as any;
});

afterAll(() => {
  global.fetch = originalFetch as any;
});

// Mock localStorage & window.dispatchEvent for authRequest
beforeEach(() => {
  mockFetch.mockReset();
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

describe('registerJobSeeker', () => {
  it('should register a job seeker', async () => {
    const payload = { email: 'a@b.com', password: 'pass', fullName: 'John' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...payload, id: 'user-1' }),
    });
    const res = await registerJobSeeker(payload);
    expect(res).toEqual({ ...payload, id: 'user-1' });
  });
});

describe('registerCompany', () => {
  it('should register a company', async () => {
    const payload = { email: 'c@co.com', password: 'pass', companyName: 'Acme' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...payload, id: 'company-1' }),
    });
    const res = await registerCompany(payload);
    expect(res).toEqual({ ...payload, id: 'company-1' });
  });
});

describe('login', () => {
  it('should login successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'mock-token' }),
    });
    const res = await login('test@example.com', 'pass');
    expect(res.access_token).toBe('mock-token');
  });

  it('should throw on 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    await expect(login('fail@example.com', 'pass')).rejects.toThrow('Invalid email or password.');
  });
});

describe('getProfile', () => {
  it('should fetch profile', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'user-1', email: 'test@example.com', role: 'JOB_SEEKER', createdAt: new Date().toISOString(), jobSeeker: { id: 1, fullName: 'John Doe' } }),
    });
    const res = await getProfile();
    expect(res.id).toBe('user-1');
  });
});

describe('updateProfile', () => {
  it('should update profile', async () => {
    const payload = { fullName: 'Jane Doe' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Profile updated successfully', ...payload }),
    });
    const res = await updateProfile(payload);
    expect(res.message).toBe('Profile updated successfully');
  });
});
