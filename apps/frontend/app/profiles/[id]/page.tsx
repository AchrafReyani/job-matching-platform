'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { ProfileResponse } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  params: { id: string };
}

export default function ViewProfilePage({ params }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();
  const profileId = params.id;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data: ProfileResponse = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, router, token]);

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>

        {profile?.jobSeeker ? (
          <div className="space-y-3">
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
        ) : profile?.company ? (
          <div className="space-y-3">
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
        ) : (
          <p className="text-gray-600 text-center">Profile not found.</p>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
