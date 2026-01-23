'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('Home');

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-(--color-text)">
          {t('title')}
        </h1>
        <p className="text-(--color-muted) mb-6">
          {t('subtitle')}
        </p>

        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={() => router.push('/login')}>
            {t('login')}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/register/company')}>
            {t('registerCompany')}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/register/job-seeker')}>
            {t('registerJobSeeker')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
