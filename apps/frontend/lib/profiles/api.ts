import { authRequest } from '@/lib/api';
import type { ProfileResponse } from './types';

/**
 * Fetch authenticated user's profile (auto-attaches JWT via authRequest).
 */
export async function getProfile(userId: string): Promise<ProfileResponse> {
  return authRequest<ProfileResponse>(`/profiles/${userId}`, {
    method: 'GET',
  });
}
