'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { getNewsAdmin, deleteNews, publishNews } from '@/lib/news/api';
import type { News, NewsCategory, NewsStatus, NewsAudience, PaginatedNews } from '@/lib/news/types';

export default function AdminNewsPage() {
  const t = useTranslations('News');
  const router = useRouter();
  const [newsData, setNewsData] = useState<PaginatedNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category?: NewsCategory;
    status?: NewsStatus;
    audience?: NewsAudience;
    page: number;
  }>({ page: 1 });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getNewsAdmin({
        ...filters,
        limit: 10,
      });
      setNewsData(data);
      setError(null);
    } catch {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    try {
      await deleteNews(id);
      fetchNews();
    } catch {
      alert(t('admin.form.deleteError'));
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm(t('admin.publishConfirm'))) return;
    try {
      await publishNews(id);
      fetchNews();
    } catch {
      alert(t('admin.form.publishError'));
    }
  };

  const getCategoryColor = (category: NewsCategory): string => {
    const colors: Record<NewsCategory, string> = {
      RELEASE: 'bg-blue-100 text-blue-800',
      BUG_FIX: 'bg-red-100 text-red-800',
      ANNOUNCEMENT: 'bg-purple-100 text-purple-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800',
      FEATURE_UPDATE: 'bg-green-100 text-green-800',
      SECURITY: 'bg-red-200 text-red-900',
      TIPS_AND_TRICKS: 'bg-teal-100 text-teal-800',
      EVENT: 'bg-pink-100 text-pink-800',
    };
    return colors[category];
  };

  const getStatusColor = (status: NewsStatus): string => {
    const colors: Record<NewsStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  const categories: NewsCategory[] = [
    'RELEASE', 'BUG_FIX', 'ANNOUNCEMENT', 'MAINTENANCE',
    'FEATURE_UPDATE', 'SECURITY', 'TIPS_AND_TRICKS', 'EVENT'
  ];
  const statuses: NewsStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED'];
  const audiences: NewsAudience[] = ['ALL', 'JOB_SEEKER', 'COMPANY'];

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('admin.title')}</h1>
            <p className="text-[var(--color-text)] opacity-70">{t('admin.subtitle')}</p>
          </div>
          <Button onClick={() => router.push('/dashboard/admin/news/create')}>
            {t('admin.createNews')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <select
              className="px-3 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as NewsCategory || undefined, page: 1 })}
            >
              <option value="">{t('admin.filters.all')} {t('admin.filters.category')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as NewsStatus || undefined, page: 1 })}
            >
              <option value="">{t('admin.filters.all')} {t('admin.filters.status')}</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{t(`status.${status}`)}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
              value={filters.audience || ''}
              onChange={(e) => setFilters({ ...filters, audience: e.target.value as NewsAudience || undefined, page: 1 })}
            >
              <option value="">{t('admin.filters.all')} {t('admin.filters.audience')}</option>
              {audiences.map((aud) => (
                <option key={aud} value={aud}>{t(`audience.${aud}`)}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* News List */}
        {loading ? (
          <LoadingContainer />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : newsData && newsData.data.length > 0 ? (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-secondary)]">
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.title')}</th>
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.category')}</th>
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.status')}</th>
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.audience')}</th>
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.published')}</th>
                      <th className="text-left p-4 text-[var(--color-text)]">{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsData.data.map((news: News) => (
                      <tr key={news.id} className="border-b border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {news.isPinned && (
                              <span className="text-yellow-500" title={t('pinned')}>📌</span>
                            )}
                            <span className="text-[var(--color-text)] font-medium">{news.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(news.category)}`}>
                            {t(`categories.${news.category}`)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(news.status)}`}>
                            {t(`status.${news.status}`)}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--color-text)]">
                          {t(`audience.${news.audience}`)}
                        </td>
                        <td className="p-4 text-[var(--color-text)] text-sm">
                          {news.publishedAt
                            ? new Date(news.publishedAt).toLocaleDateString()
                            : news.scheduledAt
                              ? `📅 ${new Date(news.scheduledAt).toLocaleDateString()}`
                              : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/news/edit/${news.id}`)}
                            >
                              {t('admin.editNews')}
                            </Button>
                            {news.status !== 'PUBLISHED' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handlePublish(news.id)}
                              >
                                {t('admin.form.publish')}
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(news.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {newsData.totalPages > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text)] text-sm">
                  {t('pagination.showing', {
                    from: (filters.page - 1) * 10 + 1,
                    to: Math.min(filters.page * 10, newsData.total),
                    total: newsData.total,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  >
                    {t('pagination.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={filters.page === newsData.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  >
                    {t('pagination.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-[var(--color-text)] opacity-60 mb-4">{t('admin.noNews')}</p>
            <Button onClick={() => router.push('/dashboard/admin/news/create')}>
              {t('admin.createNews')}
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
