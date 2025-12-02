'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, request } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Vacancy {
  id: number;
  title: string;
  company?: {
    companyName: string;
  };
}

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  vacancy: Vacancy;
}

export default function JobSeekerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const data = (await request('/applications/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })) as unknown;
        if (!Array.isArray(data)) throw new Error('Invalid applications response');
        setApplications(data as Application[]);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-(--color-error-dark) text-center mt-6">{error}</div>;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-(--color-bg) p-6 text-(--color-text)">
      <Card className="w-full max-w-2xl p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold text-center mb-6">My Applications</h1>

        {applications.length === 0 ? (
          <p className="text-center text-(--color-muted)">You haven&apos;t applied to any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-(--color-muted) rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{app.vacancy.title}</h2>
                <p className="text-(--color-muted)">
                  {app.vacancy.company?.companyName ?? 'Unknown Company'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(app.status)}`}
                  >
                    {app.status}
                  </span>
                  <span className="text-sm text-(--color-muted)">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            onClick={() => router.push('/dashboard/job-seeker')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
