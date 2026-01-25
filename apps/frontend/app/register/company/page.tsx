'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { registerCompany, login } from '@/lib/auth/api';
import { saveToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const t = useTranslations('Register.company');
  const tAuth = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerCompany({
        email,
        password,
        companyName,
        websiteUrl,
        description,
      });

      const { access_token } = await login(email, password);
      saveToken(access_token);

      router.push('/dashboard/company');
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-(--color-text)">
          {t('title')}
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder={tAuth('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder={tAuth('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder={t('companyName')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <Input
            type="url"
            placeholder={t('websiteUrl')}
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />

          <textarea
            placeholder={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              border border-(--color-muted)
              rounded-lg p-2
              resize-none h-24
              bg-(--color-bg)
              text-(--color-text)
              focus:ring-2 focus:ring-(--color-primary)
              focus:outline-none
            "
          />

          {error && (
            <p className="text-(--color-destructive) text-sm text-center">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? t('registering') : t('register')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-(--color-text)">
          <p>
            {tAuth('alreadyHaveAccount')}{' '}
            <a
              href="/login"
              className="text-(--color-primary) hover:underline font-medium"
            >
              {tAuth('loginHere')}
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
