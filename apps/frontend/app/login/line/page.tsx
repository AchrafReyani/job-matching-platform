'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getProfile, readTokenFromFragment } from '@/lib/auth/api';
import { clearToken, saveToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';

/**
 * Landing page after a LINE login. The backend redirects here with the app
 * token in the URL fragment (never sent to any server). We store it exactly
 * like the password login does and route by role.
 */
export default function LineLoginCallbackPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = readTokenFromFragment(window.location.hash);
    if (!token) {
      setError(t('lineError'));
      return;
    }

    // Drop the token from the address bar / history as early as possible.
    window.history.replaceState(null, '', window.location.pathname);
    saveToken(token);

    (async () => {
      try {
        const profile = await getProfile();
        if (profile.role === 'COMPANY') {
          router.replace('/dashboard/company');
        } else if (profile.role === 'JOB_SEEKER') {
          router.replace('/dashboard/job-seeker');
        } else if (profile.role === 'ADMIN') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/home');
        }
      } catch (err: unknown) {
        console.error(err);
        clearToken();
        setError(t('lineError'));
      }
    })();
  }, [router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <Card className="w-full max-w-md p-6 text-center text-(--color-text)">
        {error ? (
          <>
            <p className="text-(--color-error) text-sm mb-4">{error}</p>
            <a
              href="/login"
              className="text-(--color-primary) hover:underline font-medium"
            >
              {t('login')}
            </a>
          </>
        ) : (
          <p>{t('lineFinishing')}</p>
        )}
      </Card>
    </div>
  );
}
