'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProfileData {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  createdAt: string;
  jobSeeker?: {
    fullName?: string;
    portfolioUrl?: string;
    experienceSummary?: string;
  };
  company?: {
    companyName?: string;
    websiteUrl?: string;
    description?: string;
  };
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
        setProfile(data);
      } catch (err) {
        console.error('Profile fetch failed', err);
        setError('Session expired. Please log in again.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <Card className="w-full max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>

      {profile ? (
        <div className="space-y-3">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>User ID (UUID):</strong> {profile.id}</p>
          <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}</p>

          {profile.role === 'JOB_SEEKER' && profile.jobSeeker && (
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
          )}

          {profile.role === 'COMPANY' && profile.company && (
            <div className="mt-4 border-t pt-3">
              <h2 className="font-semibold text-lg mb-2">Company Info</h2>
              <p><strong>Company:</strong> {profile.company.companyName}</p>
              {profile.company.websiteUrl && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href={profile.company.websiteUrl}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {profile.company.websiteUrl}
                  </a>
                </p>
              )}
              {profile.company.description && (
                <p><strong>Description:</strong> {profile.company.description}</p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No profile data found.</p>
      )}
    </Card>
  );
}
