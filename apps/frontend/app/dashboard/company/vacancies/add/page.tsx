'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">{t('title')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder={t('jobTitle')}
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder={t('role')}
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            required
          />

          <textarea
            placeholder={t('jobDescription')}
            value={form.jobDescription}
            onChange={(e) => updateField('jobDescription', e.target.value)}
            className="border rounded-lg p-2 resize-none h-24
              focus:outline-none focus:ring-2 focus:ring-(--color-primary)
              bg-(--color-bg) text-(--color-text)"
            required
          />

          <Input
            type="text"
            placeholder={t('salaryRange')}
            value={form.salaryRange}
            onChange={(e) => updateField('salaryRange', e.target.value)}
          />

          {error && (
            <p className="text-(--color-error-dark) text-sm text-center">{error}</p>
          )}

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              className="bg-(--color-secondary) hover:bg-secondary-dark text-(--color-on-primary)"
              onClick={() => router.push('/dashboard/company/vacancies')}
            >
              {tCommon('back')}
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            >
              {loading ? t('adding') : t('addVacancy')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
