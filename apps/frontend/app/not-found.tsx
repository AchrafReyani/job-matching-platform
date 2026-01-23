'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations('NotFound');

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg) text-(--color-text) p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-(--color-primary) mb-4">{t('title')}</h1>
        <h2 className="text-2xl font-semibold mb-2">{t('heading')}</h2>
        <p className="text-(--color-muted) mb-8 max-w-md">
          {t('description')}
        </p>
        <Button onClick={handleGoBack}>
          {t('goBack')}
        </Button>
      </div>
    </div>
  );
}
