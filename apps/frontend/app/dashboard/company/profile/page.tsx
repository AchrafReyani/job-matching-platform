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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Company Profile</h1>

        {profile?.company ? (
          <div className="space-y-3">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>User ID:</strong> {profile.id}</p>
            <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}</p>

            <div className="mt-4 border-t pt-3">
              <h2 className="font-semibold text-lg mb-2">Company Info</h2>
              <p><strong>Company Name:</strong> {profile.company.companyName}</p>
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

            <div className="mt-6 text-center">
              <Button onClick={() => router.push('/dashboard/company')}>Back to Dashboard</Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center">No company profile found.</p>
        )}
      </Card>
    </div>
  );
}
