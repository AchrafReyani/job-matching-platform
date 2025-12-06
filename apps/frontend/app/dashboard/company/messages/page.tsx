'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanyApplications } from '@/lib/applications/api';
import type { Application } from '@/lib/applications/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ApplicationUI {
  id: number;
  vacancyTitle: string;
  jobSeekerName: string;
  status: string;
}

export default function CompanyMessagesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data: Application[] = await getCompanyApplications();

        const acceptedApps: ApplicationUI[] = data
          .filter(app => app.status === 'ACCEPTED')
          .map(app => ({
            id: app.id,
            vacancyTitle: app.vacancy?.title || 'Untitled Vacancy',
            jobSeekerName: app.jobSeeker?.fullName || 'Unknown Applicant',
            status: app.status,
          }));

        setApplications(acceptedApps);
      } catch (err) {
        console.error(err);
        setError('Failed to load messages list.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div className="flex justify-center mt-10 text-(--color-text)">Loading...</div>;
  if (error) return <div className="text-(--color-error-dark) text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-(--color-bg) p-6 flex flex-col items-center text-(--color-text)">
      <h1 className="text-2xl font-bold mb-6">Your Chats</h1>

      {applications.length === 0 ? (
        <p className="text-(--color-muted) text-center">No accepted applications yet.</p>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          {applications.map(app => (
            <Card key={app.id} className="p-4 bg-(--color-secondary) text-(--color-text)">
              <h2 className="font-semibold text-lg">{app.jobSeekerName}</h2>
              <p className="text-(--color-text)">
                <strong>Vacancy:</strong> {app.vacancyTitle}
              </p>
              <p className="text-(--color-muted) text-sm mt-1">Status: {app.status}</p>

              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => router.push(`/dashboard/company/messages/${app.id}`)}
                >
                  Open Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => router.push('/dashboard/company')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
