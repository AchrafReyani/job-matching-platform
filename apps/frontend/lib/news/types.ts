export type NewsCategory =
  | 'RELEASE'
  | 'BUG_FIX'
  | 'ANNOUNCEMENT'
  | 'MAINTENANCE'
  | 'FEATURE_UPDATE'
  | 'SECURITY'
  | 'TIPS_AND_TRICKS'
  | 'EVENT';

export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export type NewsAudience = 'ALL' | 'JOB_SEEKER' | 'COMPANY';

export interface News {
  id: number;
  title: string;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  audience: NewsAudience;
  isPinned: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
}

export interface PaginatedNews {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateNewsInput {
  title: string;
  content: string;
  category: NewsCategory;
  audience?: NewsAudience;
  status?: NewsStatus;
  isPinned?: boolean;
  scheduledAt?: string;
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  category?: NewsCategory;
  audience?: NewsAudience;
  status?: NewsStatus;
  isPinned?: boolean;
  scheduledAt?: string;
}

export interface NewsQueryParams {
  category?: NewsCategory;
  status?: NewsStatus;
  audience?: NewsAudience;
  page?: number;
  limit?: number;
}
