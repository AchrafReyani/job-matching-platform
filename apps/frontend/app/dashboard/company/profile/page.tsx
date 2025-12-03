'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile, ProfileResponse } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardCompanyProfilePage() {
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
        if (data.role !== 'COMPANY') {
          router.push('/dashboard/job-seeker'); // Redirect if wrong type
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

  if (loading) return <div className="flex justify-center items-center min-h-screen text-(--color-text)">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-secondary) p-4">
      <Card className="w-full max-w-md p-6 bg-(--color-bg) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">Company Profile</h1>

        {profile?.company ? (
          <div className="space-y-3">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}</p>

            <div className="mt-4 border-t border-(--color-muted) pt-3">
              <h2 className="font-semibold text-lg mb-2">Company Info</h2>
              <p><strong>Company Name:</strong> {profile.company.companyName}</p>
              {profile.company.websiteUrl && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href={profile.company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--color-primary) underline"
                  >
                    {profile.company.websiteUrl}
                  </a>
                </p>
              )}
              {profile.company.description && (
                <p><strong>Description:</strong> {profile.company.description}</p>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button onClick={() => router.push('/dashboard/company')} className="bg-(--color-secondary) text-(--color-text) hover:bg-secondary-dark">
                Back to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/dashboard/company/profile/edit')}
                className="bg-(--color-primary) text-(--color-on-primary) hover:bg-primary-dark"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-(--color-muted) text-center">No company profile found.</p>
        )}
      </Card>
    </div>
  );
}
