'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getToken, clearToken } from '@/lib/api';
import { getProfile } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    (async () => {
      const profile = await getProfile(token);
      setName(profile?.jobSeeker?.fullName || 'Job Seeker');
    })();
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg) p-6">
      <h1 className="text-2xl font-bold mb-6 text-(--color-text)">
        Welcome, {name}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button onClick={() => router.push('/dashboard/job-seeker/profile')}>
          View Profile
        </Button>
        <Button onClick={() => router.push('/dashboard/job-seeker/vacancies')}>
          Browse Vacancies
        </Button>
        <Button onClick={() => router.push('/dashboard/job-seeker/applications')}>
          Browse Applications
        </Button>
        <Button onClick={() => router.push('/dashboard/job-seeker/messages')}>
          Messages
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
