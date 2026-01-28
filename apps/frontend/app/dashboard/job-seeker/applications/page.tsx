'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type { Application } from '@/lib/applications/types';
import { getMyApplications } from '@/lib/applications/api';

export default function JobSeekerApplicationsPage() {
  const t = useTranslations('Applications.jobSeeker');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [t]);

  return (
    <DashboardLayout requiredRole="JOB_SEEKER">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>

        {loading ? (
          <LoadingContainer />
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : applications.length === 0 ? (
          <EmptyState description={t('noApplications')} className="py-10" />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">
                      {app.vacancy.title}
                    </h2>
                    <p className="text-[var(--color-text)] opacity-70">
                      {app.vacancy.company?.companyName ?? t('unknownCompany')}
                    </p>
                  </div>
                  <StatusBadge
                    status={app.status}
                    label={t(`status.${app.status.toLowerCase()}`)}
                  />
                </div>
                <p className="text-sm text-[var(--color-text)] opacity-60 mt-2">
                  {t('appliedOn')} {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
