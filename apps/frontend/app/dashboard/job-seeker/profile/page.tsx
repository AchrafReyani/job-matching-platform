'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProfileDetailsJobSeeker from '@/features/profile/components/ProfileDetailsJobSeeker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingContainer } from '@/components/ui/LoadingSpinner';
import { getProfile } from '@/lib/auth/api';
import type { ProfileResponse } from '@/lib/auth/types';

export default function DashboardJobSeekerProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Profile.jobSeeker');

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout requiredRole="JOB_SEEKER">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <Button onClick={() => router.push('/dashboard/job-seeker/profile/edit')}>
            {t('editProfile')}
          </Button>
        </div>

        {loading ? (
          <LoadingContainer />
        ) : profile ? (
          <Card className="p-6">
            <ProfileDetailsJobSeeker profile={profile} />
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
