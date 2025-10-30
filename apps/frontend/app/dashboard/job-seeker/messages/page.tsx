'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Application {
  id: number;
  status: string;
  vacancy: {
    title: string;
    company: {
      companyName: string;
    };
  };
}

export default function JobSeekerMessagesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const fetchAcceptedApplications = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
/* eslint-disable @typescript-eslint/no-explicit-any */
      const acceptedApps = data
        .filter((app: any) => app.status === 'ACCEPTED')
        .map((app: any) => ({
          id: app.id,
          status: app.status,
          vacancy: {
            title: app.vacancy?.title || 'Untitled Vacancy',
            company: {
              companyName: app.vacancy?.company?.companyName || 'Unknown Company',
            },
          },
        }));
/* eslint-enable @typescript-eslint/no-explicit-any */

      setApplications(acceptedApps);
    } catch (err) {
      console.error(err);
      setError('Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedApplications();
  }, []);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <Card className="w-full max-w-3xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Chats</h1>

        {applications.length === 0 ? (
          <p className="text-gray-600 text-center">No accepted applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-semibold">{app.vacancy.title}</p>
                  <p className="text-gray-600 text-sm">
                    {app.vacancy.company.companyName}
                  </p>
                </div>
                <Button
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
          <Button onClick={() => router.push('/dashboard/job-seeker')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
