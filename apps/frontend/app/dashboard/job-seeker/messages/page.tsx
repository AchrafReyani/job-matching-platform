'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Application, ApplicationList } from '@/lib/applications/types';
import { getMyApplications } from '@/lib/applications/api';

export default function JobSeekerMessagesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationList>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcceptedApplications = async () => {
      try {
        const data = await getMyApplications();
        const acceptedApps = data.filter(app => app.status === 'ACCEPTED');
        setApplications(acceptedApps);
      } catch (err) {
        console.error(err);
        setError('Could not load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedApplications();
  }, []);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-(--color-error-dark) text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col items-center p-6 text-(--color-text)">
      <Card className="w-full max-w-3xl p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Chats</h1>

        {applications.length === 0 ? (
          <p className="text-(--color-muted) text-center">No accepted applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div
                key={app.id}
                className="border border-(--color-muted) rounded-lg p-4 flex justify-between items-center hover:bg-secondary-dark transition"
              >
                <div>
                  <p className="font-semibold">{app.vacancy.title}</p>
                  <p className="text-(--color-muted) text-sm">
                    {app.vacancy.company?.companyName ?? 'Unknown Company'}
                  </p>
                </div>
                <Button
                  className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
                  onClick={() =>
                    router.push(`/dashboard/job-seeker/messages/${app.id}`)
                  }
                >
                  Open Chat
                </Button>
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
