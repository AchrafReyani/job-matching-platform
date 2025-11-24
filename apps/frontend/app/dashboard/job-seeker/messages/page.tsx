'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Full API types
interface Company {
  id: number;
  userId: string;
  companyName: string;
  websiteUrl: string;
  description: string;
}

interface Vacancy {
  id: number;
  companyId: number;
  title: string;
  salaryRange: string;
  role: string;
  jobDescription: string;
  createdAt: string;
  company: Company;
}

interface Application {
  id: number;
  vacancyId: number;
  jobSeekerId: number;
  status: string; // 'ACCEPTED' | 'PENDING' | 'REJECTED'
  appliedAt: string;
  vacancy: Vacancy;
}

// UI-friendly type
interface ApplicationUI {
  id: number;
  status: string;
  vacancy: {
    title: string;
    company: { companyName: string };
  };
}

export default function JobSeekerMessagesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationUI[]>([]);
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

      const data: Application[] = await res.json();

      const acceptedApps: ApplicationUI[] = data
        .filter(app => app.status === 'ACCEPTED')
        .map(app => ({
          id: app.id,
          status: app.status,
          vacancy: {
            title: app.vacancy?.title || 'Untitled Vacancy',
            company: {
              companyName: app.vacancy?.company?.companyName || 'Unknown Company',
            },
          },
        }));

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
  if (error) return <div className="text-[var(--color-error-dark)] text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center p-6 text-[var(--color-text)]">
      <Card className="w-full max-w-3xl p-6 bg-[var(--color-secondary)] text-[var(--color-text)]">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Chats</h1>

        {applications.length === 0 ? (
          <p className="text-[var(--color-muted)] text-center">No accepted applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div
                key={app.id}
                className="border border-[var(--color-muted)] rounded-lg p-4 flex justify-between items-center hover:bg-[var(--color-secondary-dark)] transition"
              >
                <div>
                  <p className="font-semibold">{app.vacancy.title}</p>
                  <p className="text-[var(--color-muted)] text-sm">
                    {app.vacancy.company.companyName}
                  </p>
                </div>
                <Button
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-on-primary)]"
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
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-on-primary)]"
            onClick={() => router.push('/dashboard/job-seeker')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
