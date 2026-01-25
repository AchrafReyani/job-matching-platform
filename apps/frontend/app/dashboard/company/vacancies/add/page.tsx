'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createVacancy } from '@/lib/vacancies/api';
import type { CreateVacancyPayload } from '@/lib/vacancies/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddVacancyPage() {
  const router = useRouter();
  const t = useTranslations('Vacancies.add');
  const tCommon = useTranslations('Common');

  const [form, setForm] = useState<CreateVacancyPayload>({
    title: '',
    role: '',
    jobDescription: '',
    salaryRange: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof CreateVacancyPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createVacancy(form);
      router.push('/dashboard/company/vacancies');
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">{t('title')}</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t('jobTitle')}
              </label>
              <Input
                type="text"
                placeholder={t('jobTitlePlaceholder')}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t('role')}
              </label>
              <Input
                type="text"
                placeholder={t('rolePlaceholder')}
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t('jobDescription')}
              </label>
              <textarea
                placeholder={t('jobDescriptionPlaceholder')}
                value={form.jobDescription}
                onChange={(e) => updateField('jobDescription', e.target.value)}
                className="w-full border border-[var(--color-secondary)] rounded-lg p-3 resize-none h-32
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                  bg-[var(--color-bg)] text-[var(--color-text)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t('salaryRange')}
              </label>
              <Input
                type="text"
                placeholder={t('salaryRangePlaceholder')}
                value={form.salaryRange}
                onChange={(e) => updateField('salaryRange', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/company/vacancies')}
              >
                {tCommon('cancel')}
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? t('adding') : t('addVacancy')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
