import { Request } from 'express';

export interface AuthenticatedUser {
  userId?: string;
  sub?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Helper to extract userId from authenticated request
 * Handles both userId and sub fields for JWT compatibility
 */
export function getUserId(req: AuthenticatedRequest): string {
  const userId = req.user.userId || req.user.sub;
  if (!userId) {
    throw new Error('User ID not found in request');
  }
  return userId;
}
