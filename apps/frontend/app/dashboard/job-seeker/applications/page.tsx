'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Application } from '@/lib/applications/types';
import { getMyApplications } from '@/lib/applications/api';

export default function JobSeekerApplicationsPage() {
  const router = useRouter();
  const t = useTranslations('Applications.jobSeeker');
  const tCommon = useTranslations('Common');
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
  }, [router, t]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]';
      case 'REJECTED':
        return 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]';
      default:
        return 'bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]';
    }
  };

  if (loading) return <div className="flex justify-center mt-10">{tCommon('loading')}</div>;
  if (error) return <div className="text-(--color-error-dark) text-center mt-6">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-(--color-bg) p-6 text-(--color-text)">
      <Card className="w-full max-w-2xl p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold text-center mb-6">{t('title')}</h1>

        {applications.length === 0 ? (
          <p className="text-center text-(--color-muted)">
            {t('noApplications')}
          </p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-4 shadow-sm hover:shadow-md">
                <h2 className="text-lg font-semibold">{app.vacancy.title}</h2>
                <p className="text-(--color-muted)">
                  {app.vacancy.company?.companyName ?? t('unknownCompany')}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                      app.status
                    )}`}
                  >
                    {t(`status.${app.status.toLowerCase()}`)}
                  </span>
                  <span className="text-sm text-(--color-muted)">
                    {t('appliedOn')} {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            onClick={() => router.push('/dashboard/job-seeker')}
          >
            {tCommon('backToDashboard')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
