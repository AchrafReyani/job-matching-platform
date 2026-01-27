/**
 * @jest-environment jsdom
 */

import {
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount,
} from './api';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('changePassword', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await changePassword({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/password'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            currentPassword: 'oldPassword',
            newPassword: 'newPassword123',
          }),
        }),
      );
    });

    it('should throw error if no auth token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        changePassword({
          currentPassword: 'old',
          newPassword: 'new12345',
        }),
      ).rejects.toThrow('No auth token found');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Current password is incorrect' }),
      });

      await expect(
        changePassword({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return notification preferences', async () => {
      const mockPrefs = {
        applicationAccepted: true,
        applicationRejected: true,
        newMessages: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrefs,
      });

      const result = await getNotificationPreferences();

      expect(result).toEqual(mockPrefs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/notification-preferences'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        }),
      );
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update and return notification preferences', async () => {
      const newPrefs = { applicationAccepted: false };
      const returnedPrefs = {
        applicationAccepted: false,
        applicationRejected: true,
        newMessages: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => returnedPrefs,
      });

      const result = await updateNotificationPreferences(newPrefs);

      expect(result).toEqual(returnedPrefs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/notification-preferences'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(newPrefs),
        }),
      );
    });
  });

  describe('deleteAccount', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteAccount({
        password: 'password123',
        confirmation: 'DELETE',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/delete'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            password: 'password123',
            confirmation: 'DELETE',
          }),
        }),
      );
    });

    it('should throw error if no auth token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        deleteAccount({
          password: 'password',
          confirmation: 'DELETE',
        }),
      ).rejects.toThrow('No auth token found');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Password is incorrect' }),
      });

      await expect(
        deleteAccount({
          password: 'wrongPassword',
          confirmation: 'DELETE',
        }),
      ).rejects.toThrow('Password is incorrect');
    });
  });
});
