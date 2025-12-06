'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, getProfile } from '@/lib/auth/api';
import { saveToken, getToken, clearToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔐 If already logged in, send to the right dashboard
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const profile = await getProfile();
        if (profile.role === 'JOB_SEEKER') {
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
      // 1️⃣ Login and get token
      const { access_token } = await login(email, password);
      saveToken(access_token);

      // 2️⃣ Get user profile to determine role
      const profile = await getProfile();

      // 3️⃣ Redirect based on role
      if (profile.role === 'JOB_SEEKER') {
        router.push('/dashboard/job-seeker');
      } else if (profile.role === 'COMPANY') {
        router.push('/dashboard/company');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-(--color-text)">
          Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-(--color-error) text-sm text-center">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-(--color-text)">
          <p>
            Don’t have an account?{' '}
            <a
              href="/home"
              className="text-(--color-primary) hover:underline font-medium"
            >
              Go back
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
