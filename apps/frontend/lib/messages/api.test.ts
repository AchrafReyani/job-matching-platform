import { sendMessage, getMessages } from './api';
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

describe('messages API', () => {
  it('should send a message successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        applicationId: 1,
        messageText: 'Test message',
        senderId: 'user-123',
        sentAt: new Date().toISOString(),
      }),
    });

    const payload = { applicationId: 1, messageText: 'Test message' };
    const message = await sendMessage(payload);

    expect(message).toBeDefined();
    expect(message.messageText).toBe('Test message');
  });

  it('should fetch messages for an application', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          applicationId: 1,
          senderId: 'user-123',
          messageText: 'Hello!',
          sentAt: new Date().toISOString(),
          sender: { id: 'user-123', email: 'user@example.com', role: 'JOB_SEEKER' },
        },
      ],
    });

    const messages = await getMessages(1);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toHaveProperty('sender');
  });

  it('should throw error if no auth token', async () => {
    localStorage.clear();

    await expect(sendMessage({ applicationId: 1, messageText: 'Test' })).rejects.toThrow('No auth token found');
  });
});
