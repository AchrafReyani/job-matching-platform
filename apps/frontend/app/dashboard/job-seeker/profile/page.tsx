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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-(--color-text) bg-(--color-bg)">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-(--color-error-dark) text-center mt-10">{error}</div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>

        {profile?.jobSeeker ? (
          <div className="space-y-3">
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}
            </p>

            <div className="mt-4 border-t border-(--color-muted) pt-3">
              <h2 className="font-semibold text-lg mb-2">Job Seeker Info</h2>
              <p>
                <strong>Name:</strong> {profile.jobSeeker.fullName}
              </p>
              {profile.jobSeeker.portfolioUrl && (
                <p>
                  <strong>Portfolio:</strong>{' '}
                  <a
                    href={profile.jobSeeker.portfolioUrl}
                    target="_blank"
                    className="text-(--color-primary) underline"
                  >
                    {profile.jobSeeker.portfolioUrl}
                  </a>
                </p>
              )}
              {profile.jobSeeker.experienceSummary && (
                <p>
                  <strong>Experience:</strong> {profile.jobSeeker.experienceSummary}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)" onClick={() => router.push('/dashboard/job-seeker')}>
                Back to Dashboard
              </Button>
              <Button
                className="bg-(--color-accent) hover:bg-accent-dark text-(--color-on-primary)"
                onClick={() => router.push('/dashboard/job-seeker/profile/edit')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-(--color-muted) text-center">No job seeker profile found.</p>
        )}
      </Card>
    </div>
  );
}
