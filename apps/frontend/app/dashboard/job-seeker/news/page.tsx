'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { getNews, markNewsAsRead } from '@/lib/news/api';
import type { News, PaginatedNews, NewsCategory } from '@/lib/news/types';

export default function JobSeekerNewsPage() {
  const t = useTranslations('News');
  const [newsData, setNewsData] = useState<PaginatedNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNews(page, 10);
      setNewsData(data);
      setError(null);
    } catch {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleExpand = async (news: News) => {
    if (expandedId === news.id) {
      setExpandedId(null);
    } else {
      setExpandedId(news.id);
      if (!news.isRead) {
        try {
          await markNewsAsRead(news.id);
          // Update local state to mark as read
          if (newsData) {
            setNewsData({
              ...newsData,
              data: newsData.data.map((n) =>
                n.id === news.id ? { ...n, isRead: true } : n
              ),
            });
          }
        } catch {
          // Silent fail for marking as read
        }
      }
    }
  };

  const getCategoryColor = (category: NewsCategory): string => {
    const colors: Record<NewsCategory, string> = {
      RELEASE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      BUG_FIX: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      ANNOUNCEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      FEATURE_UPDATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SECURITY: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
      TIPS_AND_TRICKS: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      EVENT: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[category];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for bold, headers, and lists
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-[var(--color-text)]">
              {line.replace('## ', '')}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="text-xl font-bold mt-4 mb-2 text-[var(--color-text)]">
              {line.replace('# ', '')}
            </h2>
          );
        }
        // Lists
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 text-[var(--color-text)]">
              {renderInlineMarkdown(line.replace('- ', ''))}
            </li>
          );
        }
        // Empty line
        if (line.trim() === '') {
          return <br key={i} />;
        }
        // Regular paragraph
        return (
          <p key={i} className="text-[var(--color-text)]">
            {renderInlineMarkdown(line)}
          </p>
        );
      });
  };

  const renderInlineMarkdown = (text: string) => {
    // Bold text **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <DashboardLayout requiredRole="JOB_SEEKER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <p className="text-[var(--color-text)] opacity-70">{t('subtitle')}</p>
        </div>

        {loading ? (
          <LoadingContainer />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : newsData && newsData.data.length > 0 ? (
          <>
            <div className="space-y-4">
              {newsData.data.map((news) => (
                <Card
                  key={news.id}
                  className={`p-4 cursor-pointer transition-all ${
                    !news.isRead ? 'border-l-4 border-l-[var(--color-primary)]' : ''
                  }`}
                  onClick={() => handleExpand(news)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {news.isPinned && (
                          <span className="text-yellow-500" title={t('pinned')}>
                            📌
                          </span>
                        )}
                        {!news.isRead && (
                          <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                            news.category
                          )}`}
                        >
                          {t(`categories.${news.category}`)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {news.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text)] opacity-60 mt-1">
                        {formatDate(news.publishedAt || news.createdAt)}
                      </p>
                    </div>
                    <span className="text-[var(--color-text)] opacity-50">
                      {expandedId === news.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {expandedId === news.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-secondary)]">
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(news.content)}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {newsData.totalPages > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text)] text-sm">
                  {t('pagination.showing', {
                    from: (page - 1) * 10 + 1,
                    to: Math.min(page * 10, newsData.total),
                    total: newsData.total,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    {t('pagination.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === newsData.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    {t('pagination.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-[var(--color-text)] opacity-60">{t('noNews')}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
