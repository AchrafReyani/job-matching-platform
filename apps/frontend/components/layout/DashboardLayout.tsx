'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth/api';
import LoadingScreen from '@/components/common/LoadingScreen';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'JOB_SEEKER' | 'COMPANY';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'JOB_SEEKER' | 'COMPANY' | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getProfile();
        const userRole = profile.role as 'JOB_SEEKER' | 'COMPANY';

        if (requiredRole && userRole !== requiredRole) {
          // Redirect to correct dashboard if role doesn't match
          const correctPath = userRole === 'JOB_SEEKER'
            ? '/dashboard/job-seeker'
            : '/dashboard/company';
          router.push(correctPath);
          return;
        }

        setRole(userRole);
        setUserName(
          userRole === 'JOB_SEEKER'
            ? profile.jobSeeker?.fullName || 'Job Seeker'
            : profile.company?.companyName || 'Company'
        );
      } catch {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading || !role) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar role={role} userName={userName} />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
