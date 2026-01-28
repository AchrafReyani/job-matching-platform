'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCompanyApplications, updateApplication } from '@/lib/applications/api';
import type { Application, ApplicationStatus } from '@/lib/applications/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const t = useTranslations('Applications.company');

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getCompanyApplications();
        setApplications(list);
      } catch (err) {
        console.error(err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  const handleDecision = async (id: number, status: ApplicationStatus) => {
    const confirmMsg =
      status === 'ACCEPTED'
        ? t('confirmAccept')
        : t('confirmReject');

    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(id);
      await updateApplication(id, { status });
      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
    } catch (err) {
      console.error(err);
      alert(t('updateError'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout requiredRole="COMPANY">
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
                    <p className="text-[var(--color-text)]">
                      {t('applicant')}: <strong>{app.jobSeeker.fullName}</strong>
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => router.push(`/profiles/${app.jobSeeker.userId}`)}
                    >
                      {t('viewProfile')}
                    </Button>
                  </div>
                  <StatusBadge
                    status={app.status}
                    label={t(`status.${app.status.toLowerCase()}`)}
                  />
                </div>

                <p className="text-sm text-[var(--color-text)] opacity-60 mt-2">
                  {t('appliedOn')} {new Date(app.appliedAt).toLocaleDateString()}
                </p>

                {app.status === 'APPLIED' && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      disabled={processingId === app.id}
                      onClick={() => handleDecision(app.id, 'ACCEPTED')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {t('accept')}
                    </Button>
                    <Button
                      disabled={processingId === app.id}
                      onClick={() => handleDecision(app.id, 'REJECTED')}
                      variant="destructive"
                    >
                      {t('reject')}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
