'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getProfile } from '@/lib/auth/api';
import type { ProfileResponse } from '@/lib/auth/types';

import { getVacanciesByCompany } from '@/lib/vacancies/api';
import type { Vacancy } from '@/lib/vacancies/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CompanyVacanciesPage() {
  const router = useRouter();
  const t = useTranslations('Vacancies.list');
  const tCommon = useTranslations('Common');

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const profile: ProfileResponse = await getProfile();
        if (!profile.company?.id) throw new Error('Company ID not found');

        const companyId = profile.company.id;
        const data = await getVacanciesByCompany(companyId);
        setVacancies(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <Button onClick={() => router.push('/dashboard/company/vacancies/add')}>
            {t('addNew')}
          </Button>
        </div>

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
          <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <Card key={vacancy.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg text-[var(--color-text)]">
                      {vacancy.title}
                    </h2>
                    <p className="text-[var(--color-text)]">
                      <strong>{t('role')}:</strong> {vacancy.role}
                    </p>
                    {vacancy.salaryRange && (
                      <p className="text-[var(--color-text)]">
                        <strong>{t('salary')}:</strong> {vacancy.salaryRange}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/company/vacancies/edit/${vacancy.id}`)
                    }
                  >
                    {tCommon('edit')}
                  </Button>
                </div>
                <p className="text-[var(--color-text)] mt-2">{vacancy.jobDescription}</p>
                <p className="text-sm text-[var(--color-text)] opacity-60 mt-1">
                  {t('posted')}: {new Date(vacancy.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
