import { authRequest } from '../api';
import type { ChangePasswordData, NotificationPreferences, DeleteAccountData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/**
 * Change the current user's password
 */
export async function changePassword(data: ChangePasswordData): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    throw new Error('No auth token found');
  }

  const res = await fetch(`${API_URL}/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.message || `API error: ${res.status}`);
    } catch {
      throw new Error(`API error: ${res.status} - ${errText}`);
    }
  }
}

/**
 * Get notification preferences for the current user
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return authRequest<NotificationPreferences>('/users/me/notification-preferences');
}

/**
 * Update notification preferences for the current user
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  return authRequest<NotificationPreferences>('/users/me/notification-preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences),
  });
}

/**
 * Delete the current user's account
 */
export async function deleteAccount(data: DeleteAccountData): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    throw new Error('No auth token found');
  }

  const res = await fetch(`${API_URL}/users/me/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.message || `API error: ${res.status}`);
    } catch {
      throw new Error(`API error: ${res.status} - ${errText}`);
    }
  }
}
