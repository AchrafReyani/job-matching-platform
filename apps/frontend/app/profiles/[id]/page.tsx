'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

interface JobSeekerProfile {
  fullName?: string;
  portfolioUrl?: string;
  experienceSummary?: string;
}

interface CompanyProfile {
  companyName?: string;
  websiteUrl?: string;
  description?: string;
}

interface ProfileResponse {
  userId: string;
  role: 'JOB_SEEKER' | 'COMPANY';
  profile: JobSeekerProfile | CompanyProfile;
}

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${params.id}`, {
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
  }, [params.id, router, token]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>

        {profile.role === 'JOB_SEEKER' ? (
          <div className="space-y-3">
            <p><strong>Name:</strong> {(profile.profile as JobSeekerProfile).fullName || 'N/A'}</p>
            {(profile.profile as JobSeekerProfile).portfolioUrl && (
              <p>
                <strong>Portfolio:</strong>{' '}
                <a
                  href={(profile.profile as JobSeekerProfile).portfolioUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {(profile.profile as JobSeekerProfile).portfolioUrl}
                </a>
              </p>
            )}
            {(profile.profile as JobSeekerProfile).experienceSummary && (
              <p><strong>Experience:</strong> {(profile.profile as JobSeekerProfile).experienceSummary}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p><strong>Company Name:</strong> {(profile.profile as CompanyProfile).companyName || 'N/A'}</p>
            {(profile.profile as CompanyProfile).websiteUrl && (
              <p>
                <strong>Website:</strong>{' '}
                <a
                  href={(profile.profile as CompanyProfile).websiteUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {(profile.profile as CompanyProfile).websiteUrl}
                </a>
              </p>
            )}
            {(profile.profile as CompanyProfile).description && (
              <p><strong>Description:</strong> {(profile.profile as CompanyProfile).description}</p>
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
