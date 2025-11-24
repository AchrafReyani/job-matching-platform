'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerJobSeeker, login } from '@/lib/auth';
import { saveToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterJobSeekerPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Register
      await registerJobSeeker({
        email,
        password,
        fullName,
        portfolioUrl,
        experienceSummary,
      });

      // Auto login
      const { access_token } = await login(email, password);
      saveToken(access_token);

      router.push('/dashboard/job-seeker');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-text)]">
          Register as Job Seeker
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input type="url" placeholder="Portfolio URL (optional)" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />

          <textarea
            placeholder="Experience Summary (optional)"
            value={experienceSummary}
            onChange={(e) => setExperienceSummary(e.target.value)}
            className="
              border border-[var(--color-muted)]
              rounded-lg p-2
              resize-none h-24
              bg-[var(--color-bg)]
              text-[var(--color-text)]
              focus:ring-2 focus:ring-[var(--color-primary)]
              focus:outline-none
            "
          />

          {error && (
            <p className="text-[var(--color-destructive)] text-sm text-center">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-text)]">
          <p>
            Already have an account?{' '}
            <a
              href="/login"
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              Login here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
