'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProfileDetailsCompany from '@/features/profile/components/ProfileDetailsCompany';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProfile } from '@/lib/auth/api';
import type { ProfileResponse } from '@/lib/auth/types';

export default function DashboardCompanyProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Profile.company');

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
    <DashboardLayout requiredRole="COMPANY">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <Button onClick={() => router.push('/dashboard/company/profile/edit')}>
            {t('editProfile')}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : profile ? (
          <Card className="p-6">
            <ProfileDetailsCompany profile={profile} />
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
