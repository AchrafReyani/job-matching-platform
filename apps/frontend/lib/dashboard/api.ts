import { authRequest } from '../api';
import { DashboardStats } from './types';

export async function getDashboardStats(): Promise<DashboardStats> {
  return authRequest<DashboardStats>('/dashboard/stats');
}
