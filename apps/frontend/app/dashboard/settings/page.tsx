'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/layout/Sidebar';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth/api';
import LoadingScreen from '@/components/common/LoadingScreen';
import { PasswordSection } from '@/components/settings/PasswordSection';
import { NotificationPreferencesSection } from '@/components/settings/NotificationPreferencesSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'JOB_SEEKER' | 'COMPANY' | 'ADMIN' | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getProfile();
        const userRole = profile.role as 'JOB_SEEKER' | 'COMPANY' | 'ADMIN';

        setRole(userRole);
        setUserName(
          userRole === 'ADMIN'
            ? 'Admin'
            : userRole === 'JOB_SEEKER'
              ? profile.jobSeeker?.fullName || 'Job Seeker'
              : profile.company?.companyName || 'Company'
        );
      } catch {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading || !role) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar role={role} userName={userName} />
      <main className="ml-64 p-8">
        <div className="space-y-8 max-w-3xl">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {t('title')}
            </h1>
            <p className="text-[var(--color-text)] opacity-70 mt-1">
              {t('subtitle')}
            </p>
          </div>

          {/* Password & Security */}
          <PasswordSection />

          {/* Notification Preferences */}
          <NotificationPreferencesSection role={role} />

          {/* Appearance */}
          <AppearanceSection />

          {/* Danger Zone */}
          <DangerZoneSection role={role} />
        </div>
      </main>
    </div>
  );
}
