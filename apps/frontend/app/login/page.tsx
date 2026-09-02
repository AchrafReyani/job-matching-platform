'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { login, getProfile, lineLoginUrl } from '@/lib/auth/api';
import { saveToken, getToken, clearToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LineLoginButton } from 'renkei-next/button';

// LINE's official login button (renkei-next), stretched to the card width with the label centred.
const LINE_BUTTON_CLASS =
  'w-full [&_.rk-line-login__label]:flex-1 [&_.rk-line-login__label]:justify-center';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The backend sends the browser back to /login?error=line when a LINE login fails.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'line') {
      setError(t('lineError'));
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [t]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const profile = await getProfile();
        if (profile.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (profile.role === 'JOB_SEEKER') {
          router.push('/dashboard/job-seeker');
        } else if (profile.role === 'COMPANY') {
          router.push('/dashboard/company');
        }
      } catch {
        clearToken();
      }
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { access_token } = await login(email, password);
      saveToken(access_token);

      const profile = await getProfile();

      if (profile.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (profile.role === 'JOB_SEEKER') {
        router.push('/dashboard/job-seeker');
      } else if (profile.role === 'COMPANY') {
        router.push('/dashboard/company');
      } else {
        router.push('/home');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-(--color-text)">
          {t('login')}
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-(--color-error) text-sm text-center">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase text-(--color-muted)">
          <span className="h-px flex-1 bg-(--color-muted)" />
          {t('or')}
          <span className="h-px flex-1 bg-(--color-muted)" />
        </div>

        <div className="flex flex-col gap-3" aria-label={t('lineLogin')}>
          <LineLoginButton
            href={lineLoginUrl('job-seeker')}
            label={t('lineAsJobSeeker')}
            className={LINE_BUTTON_CLASS}
          />
          <LineLoginButton
            href={lineLoginUrl('company')}
            label={t('lineAsCompany')}
            className={LINE_BUTTON_CLASS}
          />
          <p className="text-xs text-center text-(--color-muted)">
            {t('lineHint')}
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-(--color-text)">
          <p>
            {t('noAccount')}{' '}
            <a
              href="/home"
              className="text-(--color-primary) hover:underline font-medium"
            >
              {t('goBack')}
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
