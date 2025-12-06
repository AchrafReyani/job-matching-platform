import { request, getToken } from '@/lib/api';
import type { ProfileResponse } from './types';

/**
 * Fetch public profile for a user by id.
 * This endpoint is protected by JWT on the backend, so we attach the saved token.
 *
 * Throws an Error if no token is available or if the request fails.
 */
export async function getProfile(userId: string): Promise<ProfileResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('No auth token found. User must be logged in.');
  }

  return request<ProfileResponse>(`/profiles/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
