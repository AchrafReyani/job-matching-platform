'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth/api';
import LoadingScreen from '@/components/common/LoadingScreen';

interface AuthGuardProps {
  allowedRole: 'JOB_SEEKER' | 'COMPANY';
  children: React.ReactNode;
}

export default function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const profile = await getProfile();

        if (profile.role !== allowedRole) {
          router.push(
            allowedRole === 'JOB_SEEKER'
              ? '/dashboard/company'
              : '/dashboard/job-seeker'
          );
          return;
        }

        setAuthorized(true);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [allowedRole, router]);

  if (loading) return <LoadingScreen />;
  if (!authorized) return null;

  return <>{children}</>;
}
