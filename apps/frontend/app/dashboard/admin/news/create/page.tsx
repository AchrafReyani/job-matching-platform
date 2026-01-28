'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createNews } from '@/lib/news/api';
import type { NewsCategory, NewsStatus, NewsAudience, CreateNewsInput } from '@/lib/news/types';

export default function AdminCreateNewsPage() {
  const t = useTranslations('News');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateNewsInput>({
    title: '',
    content: '',
    category: 'ANNOUNCEMENT',
    audience: 'ALL',
    status: 'DRAFT',
    isPinned: false,
  });

  const categories: NewsCategory[] = [
    'RELEASE', 'BUG_FIX', 'ANNOUNCEMENT', 'MAINTENANCE',
    'FEATURE_UPDATE', 'SECURITY', 'TIPS_AND_TRICKS', 'EVENT'
  ];
  const audiences: NewsAudience[] = ['ALL', 'JOB_SEEKER', 'COMPANY'];

  const handleSubmit = async (status: NewsStatus) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (status === 'SCHEDULED' && !formData.scheduledAt) {
      setError('Schedule date is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createNews({
        ...formData,
        status,
      });
      router.push('/dashboard/admin/news');
    } catch {
      setError(t('admin.form.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('admin.createNews')}</h1>
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Category & Audience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t('admin.form.category')}
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  value={formData.category}
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
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value as NewsAudience })}
                >
                  {audiences.map((aud) => (
                    <option key={aud} value={aud}>{t(`audience.${aud}`)}</option>
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
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            {/* Schedule Date */}
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

            {/* Pin to top */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
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
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
              >
                {t('admin.form.saveDraft')}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={loading}
              >
                {t('admin.form.publish')}
              </Button>
              {formData.scheduledAt && (
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit('SCHEDULED')}
                  disabled={loading}
                >
                  {t('admin.form.schedule')}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
