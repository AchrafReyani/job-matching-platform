'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken } from '@/lib/api';
import { getProfile, ProfileResponse } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;

  const displayName =
    profile?.role === 'JOB_SEEKER'
      ? profile.jobSeeker?.fullName
      : profile?.company?.companyName;

  const handleLogout = () => {
    clearToken();
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {displayName || 'User'}!
        </h1>

        <div className="flex flex-col gap-4 mt-6">
          <Button onClick={() => router.push('/dashboard/profile')}>Go to Profile</Button>
          <Button onClick={() => router.push('/dashboard/vacancies')}>Go to Vacancies</Button>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
