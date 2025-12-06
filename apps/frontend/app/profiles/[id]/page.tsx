'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfile } from '@/lib/profiles/api';
import type { ProfileResponse, JobSeekerProfile, CompanyProfile } from '@/lib/profiles/types';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
  const token = getToken();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await getProfile(profileId);
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

  /* ---------------- RENDER STATES ---------------- */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-(--color-text)">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-(--color-destructive) text-center mt-10">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="text-(--color-muted) text-center mt-10">
        Profile not found.
      </div>
    );

  /* ---------------- RENDER HELPERS ---------------- */

  const renderJobSeeker = (data: JobSeekerProfile) => (
    <div className="mt-4 border-t border-(--color-muted) pt-3">
      <h2 className="font-semibold text-lg mb-2 text-(--color-text)">Job Seeker Info</h2>

      {data.fullName && (
        <p className="text-(--color-text)">
          <strong>Name:</strong> {data.fullName}
        </p>
      )}

      {data.portfolioUrl && (
        <p className="text-(--color-text)">
          <strong>Portfolio:</strong>{' '}
          <a
            href={data.portfolioUrl}
            target="_blank"
            className="text-(--color-primary) underline"
            rel="noreferrer"
          >
            {data.portfolioUrl}
          </a>
        </p>
      )}

      {data.experienceSummary && (
        <p className="text-(--color-text)">
          <strong>Experience:</strong> {data.experienceSummary}
        </p>
      )}
    </div>
  );

  const renderCompany = (data: CompanyProfile) => (
    <div className="mt-4 border-t border-(--color-muted) pt-3">
      <h2 className="font-semibold text-lg mb-2 text-(--color-text)">Company Info</h2>

      {data.companyName && (
        <p className="text-(--color-text)">
          <strong>Company Name:</strong> {data.companyName}
        </p>
      )}

      {data.websiteUrl && (
        <p className="text-(--color-text)">
          <strong>Website:</strong>{' '}
          <a
            href={data.websiteUrl}
            target="_blank"
            className="text-(--color-primary) underline"
            rel="noreferrer"
          >
            {data.websiteUrl}
          </a>
        </p>
      )}

      {data.description && (
        <p className="text-(--color-text)">
          <strong>Description:</strong> {data.description}
        </p>
      )}
    </div>
  );

  /* ---------------- RENDER PAGE ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-(--color-text)">
          {profile.role === 'JOB_SEEKER' ? 'Job Seeker Profile' : 'Company Profile'}
        </h1>

        <p className="text-(--color-text)">
          <strong>Role:</strong> {profile.role}
        </p>

        {profile.role === 'JOB_SEEKER' &&
          'fullName' in profile.profile &&
          renderJobSeeker(profile.profile)}

        {profile.role === 'COMPANY' &&
          'companyName' in profile.profile &&
          renderCompany(profile.profile)}

        <div className="mt-6 text-center">
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
