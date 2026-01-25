'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCompanyApplications, updateApplication } from '@/lib/applications/api';
import type { Application, ApplicationStatus } from '@/lib/applications/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CompanyApplicationsPage() {
  const router = useRouter();

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
        setError('Failed to load company applications');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDecision = async (id: number, status: ApplicationStatus) => {
    const confirmMsg =
      status === 'ACCEPTED'
        ? 'Are you sure you want to ACCEPT this application?'
        : 'Are you sure you want to REJECT this application?';

    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(id);
      await updateApplication(id, { status });
      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Received Applications</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : applications.length === 0 ? (
          <p className="text-[var(--color-text)] opacity-70 text-center py-10">
            No one has applied to your vacancies yet.
          </p>
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
                      Applicant: <strong>{app.jobSeeker.fullName}</strong>
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => router.push(`/profiles/${app.jobSeeker.userId}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>

                <p className="text-sm text-[var(--color-text)] opacity-60 mt-2">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>

                {app.status === 'APPLIED' && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      disabled={processingId === app.id}
                      onClick={() => handleDecision(app.id, 'ACCEPTED')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Accept
                    </Button>
                    <Button
                      disabled={processingId === app.id}
                      onClick={() => handleDecision(app.id, 'REJECTED')}
                      variant="destructive"
                    >
                      Reject
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
