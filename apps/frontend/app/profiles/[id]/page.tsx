'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProfileResponse {
  userId: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  profile: {
    fullName?: string;
    portfolioUrl?: string;
    experienceSummary?: string;
    companyName?: string;
    websiteUrl?: string;
    description?: string;
  };
}

export default function ViewProfilePage() {
  const router = useRouter();
  const token = getToken();
  const params = useParams();
  const profileId = params.id;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data: ProfileResponse = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, router, token]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!profile) return <div className="text-gray-600 text-center mt-10">Profile not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {profile.role === 'JOB_SEEKER' ? 'Job Seeker Profile' : 'Company Profile'}
        </h1>

        <p><strong>Role:</strong> {profile.role}</p>

        {profile.role === 'JOB_SEEKER' && profile.profile && (
          <div className="mt-4 border-t pt-3">
            <h2 className="font-semibold text-lg mb-2">Job Seeker Info</h2>
            <p><strong>Name:</strong> {profile.profile.fullName}</p>
            {profile.profile.portfolioUrl && (
              <p>
                <strong>Portfolio:</strong>{' '}
                <a href={profile.profile.portfolioUrl} target="_blank" className="text-blue-600 underline">
                  {profile.profile.portfolioUrl}
                </a>
              </p>
            )}
            {profile.profile.experienceSummary && (
              <p><strong>Experience:</strong> {profile.profile.experienceSummary}</p>
            )}
          </div>
        )}

        {profile.role === 'COMPANY' && profile.profile && (
          <div className="mt-4 border-t pt-3">
            <h2 className="font-semibold text-lg mb-2">Company Info</h2>
            <p><strong>Company Name:</strong> {profile.profile.companyName}</p>
            {profile.profile.websiteUrl && (
              <p>
                <strong>Website:</strong>{' '}
                <a href={profile.profile.websiteUrl} target="_blank" className="text-blue-600 underline">
                  {profile.profile.websiteUrl}
                </a>
              </p>
            )}
            {profile.profile.description && (
              <p><strong>Description:</strong> {profile.profile.description}</p>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
