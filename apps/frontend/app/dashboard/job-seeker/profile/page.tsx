'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile, ProfileResponse } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardJobSeekerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        if (data.role !== 'JOB_SEEKER') {
          router.push('/dashboard/company'); // Redirect if wrong type
          return;
        }
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Session expired. Please log in again.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>

        {profile?.jobSeeker ? (
          <div className="space-y-3">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>User ID:</strong> {profile.id}</p>
            <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}</p>

            <div className="mt-4 border-t pt-3">
              <h2 className="font-semibold text-lg mb-2">Job Seeker Info</h2>
              <p><strong>Name:</strong> {profile.jobSeeker.fullName}</p>
              {profile.jobSeeker.portfolioUrl && (
                <p>
                  <strong>Portfolio:</strong>{' '}
                  <a
                    href={profile.jobSeeker.portfolioUrl}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {profile.jobSeeker.portfolioUrl}
                  </a>
                </p>
              )}
              {profile.jobSeeker.experienceSummary && (
                <p><strong>Experience:</strong> {profile.jobSeeker.experienceSummary}</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <Button onClick={() => router.push('/dashboard/job-seeker')}>Back to Dashboard</Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center">No job seeker profile found.</p>
        )}
      </Card>
    </div>
  );
}
