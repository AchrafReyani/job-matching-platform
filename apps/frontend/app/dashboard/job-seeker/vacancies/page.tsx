'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { getAllVacancies } from '@/lib/vacancies/api';
import { getAllCompanies } from '@/lib/companies/api';
import { createApplication } from '@/lib/applications/api';

import type { Vacancy } from '@/lib/vacancies/types';
import type { Company } from '@/lib/companies/types';
import type { ApiError } from '@/lib/types';

/** Type guard for ApiError */
function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('status' in err || 'message' in err)
  );
}

export default function JobSeekerVacanciesPage() {
  const router = useRouter();
  const t = useTranslations('Vacancies.browse');
  const tCommon = useTranslations('Common');

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [companies, setCompanies] = useState<Record<number, Company>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  /** ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [vacancyList, companyList] = await Promise.all([
          getAllVacancies(),
          getAllCompanies(),
        ]);

        const map: Record<number, Company> = {};
        companyList.forEach((c) => (map[c.id] = c));

        setVacancies(vacancyList);
        setCompanies(map);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  /** ---------------- APPLY TO VACANCY ---------------- */
  const handleApply = async (vacancyId: number) => {
    setSubmitting(vacancyId);
    setError(null);

    try {
      await createApplication({ vacancyId });
      setPopupMessage(t('applySuccess'));
    } catch (err: unknown) {
      console.error(err);

      if (isApiError(err)) {
        if (err.status === 409 || err.status === 403) {
          setPopupMessage(t('alreadyApplied'));
        } else {
          setPopupMessage(t('applyError'));
        }
      } else {
        setPopupMessage(t('applyError'));
      }
    } finally {
      setSubmitting(null);
    }
  };

  const closePopup = () => setPopupMessage(null);

  /** ---------------- RENDER ---------------- */

  return (
    <DashboardLayout requiredRole="JOB_SEEKER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : vacancies.length === 0 ? (
          <p className="text-[var(--color-text)] opacity-70 text-center py-10">
            {t('noVacancies')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {vacancies.map((vacancy) => {
              const company = companies[vacancy.companyId];

              return (
                <Card
                  key={vacancy.id}
                  className="p-4 border border-[var(--color-secondary)]"
                >
                  <h2 className="font-semibold text-lg text-[var(--color-text)]">
                    {vacancy.title}
                  </h2>

                  <p className="text-[var(--color-text)]">
                    <strong>{t('company')}:</strong> {company?.companyName || t('unknown')}
                  </p>

                  <p className="text-[var(--color-text)]">
                    <strong>{t('role')}:</strong> {vacancy.role}
                  </p>

                  {vacancy.salaryRange && (
                    <p className="text-[var(--color-text)]">
                      <strong>{t('salary')}:</strong> {vacancy.salaryRange}
                    </p>
                  )}

                  <p className="text-[var(--color-text)] mt-2">{vacancy.jobDescription}</p>

                  {vacancy.createdAt && (
                    <p className="text-sm text-[var(--color-text)] opacity-60 mt-1">
                      {t('posted')}: {new Date(vacancy.createdAt).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() => handleApply(vacancy.id)}
                      disabled={submitting === vacancy.id}
                    >
                      {submitting === vacancy.id ? t('applying') : t('apply')}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push(`/profiles/${company?.userId}`)}
                      disabled={!company?.userId}
                    >
                      {t('viewProfile')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[var(--color-bg)] p-6 rounded-2xl shadow-lg max-w-sm text-center">
            <p className="mb-4 text-[var(--color-text)]">{popupMessage}</p>
            <Button onClick={closePopup}>{tCommon('ok')}</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
