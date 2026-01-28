import { authRequest } from '../api';
import type {
  News,
  PaginatedNews,
  CreateNewsInput,
  UpdateNewsInput,
  NewsQueryParams,
} from './types';

// ========== Admin API ==========

export async function getNewsAdmin(params?: NewsQueryParams): Promise<PaginatedNews> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.audience) searchParams.set('audience', params.audience);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return authRequest<PaginatedNews>(`/news/admin${query ? `?${query}` : ''}`);
}

export async function getNewsByIdAdmin(id: number): Promise<News> {
  return authRequest<News>(`/news/admin/${id}`);
}

export async function createNews(input: CreateNewsInput): Promise<News> {
  return authRequest<News>('/news', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateNews(id: number, input: UpdateNewsInput): Promise<News> {
  return authRequest<News>(`/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteNews(id: number): Promise<void> {
  await authRequest(`/news/${id}`, { method: 'DELETE' });
}

export async function publishNews(id: number): Promise<News> {
  return authRequest<News>(`/news/${id}/publish`, { method: 'POST' });
}

// ========== User API ==========

export async function getNews(page: number = 1, limit: number = 10): Promise<PaginatedNews> {
  return authRequest<PaginatedNews>(`/news?page=${page}&limit=${limit}`);
}

export async function getNewsById(id: number): Promise<News> {
  return authRequest<News>(`/news/${id}`);
}

export async function markNewsAsRead(id: number): Promise<void> {
  await authRequest(`/news/${id}/read`, { method: 'POST' });
}

export async function getNewsUnreadCount(): Promise<{ count: number }> {
  return authRequest<{ count: number }>('/news/unread-count');
}
