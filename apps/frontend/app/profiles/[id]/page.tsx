'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { ProfileResponse, getProfile } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';


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
        const data = await getProfile(token, profileId);
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

        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>

        {profile.jobSeeker && (
          <div className="mt-4 border-t pt-3">
            <h2 className="font-semibold text-lg mb-2">Job Seeker Info</h2>
            <p><strong>Name:</strong> {profile.jobSeeker.fullName}</p>
            {profile.jobSeeker.portfolioUrl && (
              <p>
                <strong>Portfolio:</strong>{' '}
                <a href={profile.jobSeeker.portfolioUrl} target="_blank" className="text-blue-600 underline">
                  {profile.jobSeeker.portfolioUrl}
                </a>
              </p>
            )}
            {profile.jobSeeker.experienceSummary && (
              <p><strong>Experience:</strong> {profile.jobSeeker.experienceSummary}</p>
            )}
          </div>
        )}

        {profile.company && (
          <div className="mt-4 border-t pt-3">
            <h2 className="font-semibold text-lg mb-2">Company Info</h2>
            <p><strong>Company Name:</strong> {profile.company.companyName}</p>
            {profile.company.websiteUrl && (
              <p>
                <strong>Website:</strong>{' '}
                <a href={profile.company.websiteUrl} target="_blank" className="text-blue-600 underline">
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
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
