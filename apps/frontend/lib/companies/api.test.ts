import { getCompany, getAllCompanies } from './api';

process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// Mock fetch globally and restore after suite so other tests see real fetch
const mockFetch = jest.fn<typeof fetch>();
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getAllCompanies', () => {
  it('should fetch all companies', async () => {
    const mockData = [
      { id: 1, companyName: 'Acme', userId: 'u1' },
      { id: 2, companyName: 'Globex', userId: 'u2' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const data = await getAllCompanies();
    expect(data).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/companies',
      expect.any(Object)
    );
  });

  it('should throw if response not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' });
    await expect(getAllCompanies()).rejects.toThrow('API error: 500 - Error');
  });
});

describe('getCompany', () => {
  it('should fetch company by id', async () => {
    const mockCompany = { id: 1, companyName: 'Acme', userId: 'u1' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockCompany });

    const data = await getCompany(1);
    expect(data).toEqual(mockCompany);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/companies/1',
      expect.any(Object)
    );
  });

  it('should throw if response not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, text: async () => 'Not found' });
    await expect(getCompany(999)).rejects.toThrow('API error: 404 - Not found');
  });
});
