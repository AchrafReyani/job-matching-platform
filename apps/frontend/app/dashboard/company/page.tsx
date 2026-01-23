'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth/api';
import { logout } from '@/lib/auth/logout';
import { useEffect, useState } from 'react';

export default function CompanyDashboard() {
  const router = useRouter();
  const t = useTranslations('Dashboard.company');
  const tHeader = useTranslations('Header');
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    (async () => {
      const profile = await getProfile();
      setCompanyName(profile?.company?.companyName || 'Company');
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg) p-6">
      <h1 className="text-2xl font-bold mb-6 text-(--color-text)">
        {t('welcome', { name: companyName ?? '' })}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button onClick={() => router.push('/dashboard/company/profile')}>
          {t('profile')}
        </Button>
        <Button onClick={() => router.push('/dashboard/company/vacancies')}>
          {t('vacancies')}
        </Button>
        <Button onClick={() => router.push('/dashboard/company/applications')}>
          {t('applications')}
        </Button>
        <Button onClick={() => router.push('/dashboard/company/messages')}>
          {t('messages')}
        </Button>
        <Button variant="destructive" onClick={logout}>
          {tHeader('logout')}
        </Button>
      </div>
    </div>
  );
}
