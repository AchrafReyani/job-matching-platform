'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { getToken } from '@/lib/api';
import { getCompanyApplications, updateApplication } from '@/lib/applications/api';
import type { Application, ApplicationStatus } from '@/lib/applications/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const t = useTranslations('Applications.company');
  const tCommon = useTranslations('Common');

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

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
  }, [router, t]);

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

  if (loading) return <div className="flex justify-center mt-10">{tCommon('loading')}</div>;

  if (error)
    return (
      <div className="text-(--color-error-dark) text-center mt-6">
        {error}
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-(--color-bg) p-6">
      <Card className="w-full max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-(--color-text)">
          {t('title')}
        </h1>

        {applications.length === 0 ? (
          <p className="text-center text-(--color-muted)">
            {t('noApplications')}
          </p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-(--color-muted) rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-(--color-text)">
                  {app.vacancy.title}
                </h2>

                <p className="text-(--color-text)">
                  {t('applicant')}: <strong>{app.jobSeeker.fullName}</strong>
                </p>

                <div className="mt-2">
                  <Button
                    onClick={() => router.push(`/profiles/${app.jobSeeker.userId}`)}
                    className="
                      bg-transparent
                      text-(--color-primary)
                      border-(--color-primary)
                      hover:bg-primary-light
                      hover:text-(--color-text)
                    "
                  >
                    {t('viewProfile')}
                  </Button>
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'ACCEPTED'
                        ? 'bg-(--color-success-light) text-(--color-success-dark)'
                        : app.status === 'REJECTED'
                        ? 'bg-(--color-error-light) text-(--color-error-dark)'
                        : 'bg-(--color-warning-light) text-(--color-warning-dark)'
                    }`}
                  >
                    {t(`status.${app.status.toLowerCase()}`)}
                  </span>

                  <span className="text-sm text-(--color-muted)">
                    {t('appliedOn')} {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex gap-3">
                  <Button
                    disabled={app.status !== 'APPLIED' || processingId === app.id}
                    onClick={() => handleDecision(app.id, 'ACCEPTED')}
                    className="text-white transition bg-(--color-success-dark) hover:bg-(--color-success-light)"
                  >
                    {t('accept')}
                  </Button>

                  <Button
                    disabled={app.status !== 'APPLIED' || processingId === app.id}
                    onClick={() => handleDecision(app.id, 'REJECTED')}
                    className="text-white transition bg-(--color-error-dark) hover:bg-(--color-error-light)"
                  >
                    {t('reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard/company')}>{tCommon('backToDashboard')}</Button>
        </div>
      </Card>
    </div>
  );
}
