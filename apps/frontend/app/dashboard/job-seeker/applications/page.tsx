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
        const data = await request('/applications/job-seeker', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }) as unknown;
        if (!Array.isArray(data)) {
          throw new Error('Invalid applications response');
        }
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
  if (error) return <div className="text-red-500 text-center mt-6">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">My Applications</h1>

        {applications.length === 0 ? (
          <p className="text-center text-gray-500">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{app.vacancy.title}</h2>
                <p className="text-gray-600">
                  {app.vacancy.company?.companyName ?? 'Unknown Company'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
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
