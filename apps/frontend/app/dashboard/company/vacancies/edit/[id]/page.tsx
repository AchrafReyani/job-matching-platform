'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import {
  getVacancyById,
  updateVacancy,
  deleteVacancy
} from '@/lib/vacancies/api';

import type { Vacancy } from '@/lib/vacancies/types';

export default function EditVacancyPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('Vacancies.edit');
  const tAdd = useTranslations('Vacancies.add');
  const tCommon = useTranslations('Common');
  const vacancyId = Number(params.id);

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVacancyById(vacancyId);

        setVacancy(data);
        setTitle(data.title);
        setRole(data.role);
        setJobDescription(data.jobDescription);
        setSalaryRange(data.salaryRange || '');

      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [vacancyId, t]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateVacancy(vacancyId, {
        title,
        role,
        jobDescription,
        salaryRange,
      });

      router.push('/dashboard/company/vacancies');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await deleteVacancy(vacancyId);
      router.push('/dashboard/company/vacancies');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  if (loading) return <div className="flex justify-center mt-10">{tCommon('loading')}</div>;
  if (error) return <div className="text-(--color-error-dark) text-center mt-10">{error}</div>;
  if (!vacancy) return <div className="text-center mt-10">{t('notFound')}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">{t('title')}</h1>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder={tAdd('jobTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder={tAdd('role')}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />

          <textarea
            placeholder={tAdd('jobDescription')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="border rounded-lg p-2 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-(--color-bg) text-(--color-text)"
            required
          />

          <Input
            type="text"
            placeholder={tAdd('salaryRange')}
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />

          {error && <p className="text-(--color-error-dark) text-sm text-center">{error}</p>}

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              className="bg-(--color-secondary) hover:bg-secondary-dark text-(--color-text)"
              onClick={() => router.push('/dashboard/company/vacancies')}
            >
              {tCommon('back')}
            </Button>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
              >
                {loading ? t('saving') : t('saveChanges')}
              </Button>

              <Button
                variant="destructive"
                className="bg-(--color-error-dark) hover:bg-(--color-error-light) text-white"
                onClick={handleDelete}
              >
                {tCommon('delete')}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
