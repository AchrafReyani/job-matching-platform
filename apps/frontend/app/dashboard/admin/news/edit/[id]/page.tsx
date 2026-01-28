'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { getNewsByIdAdmin, updateNews } from '@/lib/news/api';
import type { News, NewsCategory, NewsStatus, NewsAudience, UpdateNewsInput } from '@/lib/news/types';

export default function AdminEditNewsPage() {
  const t = useTranslations('News');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateNewsInput>({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsByIdAdmin(id);
        setNews(data);
        setFormData({
          title: data.title,
          content: data.content,
          category: data.category,
          audience: data.audience,
          status: data.status,
          isPinned: data.isPinned,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : undefined,
        });
      } catch {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const categories: NewsCategory[] = [
    'RELEASE', 'BUG_FIX', 'ANNOUNCEMENT', 'MAINTENANCE',
    'FEATURE_UPDATE', 'SECURITY', 'TIPS_AND_TRICKS', 'EVENT'
  ];
  const audiences: NewsAudience[] = ['ALL', 'JOB_SEEKER', 'COMPANY'];
  const statuses: NewsStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED'];

  const handleSubmit = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }

    if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
      setError('Schedule date is required for scheduled posts');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateNews(id, formData);
      router.push('/dashboard/admin/news');
    } catch {
      setError(t('admin.form.updateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="ADMIN">
        <LoadingContainer />
      </DashboardLayout>
    );
  }

  if (!news) {
    return (
      <DashboardLayout requiredRole="ADMIN">
        <div className="text-center py-8 text-red-500">{error || 'News not found'}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('admin.editNews')}</h1>
          <Button variant="outline" onClick={() => router.back()}>
            {tCommon('cancel')}
          </Button>
        </div>

        <Card className="p-6">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('admin.form.title')}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                placeholder={t('admin.form.titlePlaceholder')}
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Category, Audience & Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t('admin.form.category')}
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t('admin.form.audience')}
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  value={formData.audience || ''}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value as NewsAudience })}
                >
                  {audiences.map((aud) => (
                    <option key={aud} value={aud}>{t(`audience.${aud}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t('admin.form.status')}
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as NewsStatus })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{t(`status.${status}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('admin.form.content')}
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] min-h-[200px] font-mono text-sm"
                placeholder={t('admin.form.contentPlaceholder')}
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            {/* Schedule Date */}
            {(formData.status === 'SCHEDULED' || formData.scheduledAt) && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t('admin.form.scheduledAt')}
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  value={formData.scheduledAt || ''}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>
            )}

            {/* Pin to top */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned || false}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPinned" className="text-sm text-[var(--color-text)]">
                {t('admin.form.isPinned')}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? tCommon('saving') : t('admin.form.update')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
