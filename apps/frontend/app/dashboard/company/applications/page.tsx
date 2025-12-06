'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getToken } from '@/lib/api';
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
        setError('Failed to load company applications');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleDecision = async (id: number, status: ApplicationStatus) => {
    const confirmMsg =
      status === 'ACCEPTED'
        ? 'Are you sure you want to ACCEPT this application? This action cannot be undone.'
        : 'Are you sure you want to REJECT this application? This action cannot be undone.';

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

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;

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
          Received Applications
        </h1>

        {applications.length === 0 ? (
          <p className="text-center text-(--color-muted)">
            No one has applied to your vacancies yet.
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
                  Applicant: <strong>{app.jobSeeker.fullName}</strong>
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
                    View Profile
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
                    {app.status}
                  </span>

                  <span className="text-sm text-(--color-muted)">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex gap-3">
                  <Button
                    disabled={app.status !== 'APPLIED' || processingId === app.id}
                    onClick={() => handleDecision(app.id, 'ACCEPTED')}
                    className="text-white transition bg-(--color-success-dark) hover:bg-(--color-success-light)"
                  >
                    Accept
                  </Button>

                  <Button
                    disabled={app.status !== 'APPLIED' || processingId === app.id}
                    onClick={() => handleDecision(app.id, 'REJECTED')}
                    className="text-white transition bg-(--color-error-dark) hover:bg-(--color-error-light)"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard/company')}>Back to Dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
