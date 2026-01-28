import { News, NewsRead, NewsCategory, NewsStatus, NewsAudience } from '@prisma/client';

export interface NewsWithReadStatus extends News {
  isRead?: boolean;
  _count?: {
    readBy: number;
  };
}

export interface PaginatedNews {
  data: NewsWithReadStatus[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsFilters {
  category?: NewsCategory;
  status?: NewsStatus;
  audience?: NewsAudience;
  page: number;
  limit: number;
}

export interface NewsRepository {
  create(data: {
    title: string;
    content: string;
    category: NewsCategory;
    audience: NewsAudience;
    status: NewsStatus;
    isPinned: boolean;
    scheduledAt?: Date;
    publishedAt?: Date;
  }): Promise<News>;

  findById(id: number): Promise<News | null>;

  findAll(filters: NewsFilters): Promise<PaginatedNews>;

  findPublishedForUser(
    userRole: 'JOB_SEEKER' | 'COMPANY',
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedNews>;

  update(id: number, data: Partial<News>): Promise<News>;

  delete(id: number): Promise<void>;

  markAsRead(newsId: number, userId: string): Promise<NewsRead>;

  isRead(newsId: number, userId: string): Promise<boolean>;

  getUnreadCount(userId: string, userRole: 'JOB_SEEKER' | 'COMPANY'): Promise<number>;

  findScheduledToPublish(): Promise<News[]>;

  publishScheduled(ids: number[]): Promise<void>;
}

export const NEWS_REPOSITORY = Symbol('NEWS_REPOSITORY');
