'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, request } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface JobSeeker {
  id: number;
  fullName: string;
  portfolioUrl?: string;
}

interface Vacancy {
  id: number;
  title: string;
}

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  jobSeeker: JobSeeker;
  vacancy: Vacancy;
}

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

    const fetchApplications = async () => {
      try {
        const data = await request('/applications/company', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }) as unknown;

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }

        setApplications(data as Application[]);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch company applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  // 🔵 Handle accept/reject with confirmation
  const handleDecision = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const confirmMsg =
      status === 'ACCEPTED'
        ? 'Are you sure you want to ACCEPT this application? This action cannot be undone.'
        : 'Are you sure you want to REJECT this application? This action cannot be undone.';

    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to update application');
      }

      // Update UI locally
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error(err);
      alert('Error updating application. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-6">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Received Applications</h1>

        {applications.length === 0 ? (
          <p className="text-center text-gray-500">No one has applied to your vacancies yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{app.vacancy.title}</h2>
                <p className="text-gray-600">
                  Applicant: <strong>{app.jobSeeker.fullName}</strong>
                </p>
                {app.jobSeeker.portfolioUrl && (
                  <a
                    href={app.jobSeeker.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Portfolio
                  </a>
                )}
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

                {/* Buttons */}
                <div className="mt-3 flex gap-3">
                  <Button
                    disabled={
                      app.status !== 'APPLIED' || processingId === app.id
                    }
                    onClick={() => handleDecision(app.id, 'ACCEPTED')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    disabled={
                      app.status !== 'APPLIED' || processingId === app.id
                    }
                    onClick={() => handleDecision(app.id, 'REJECTED')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard/company')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
