'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to JobMatch</h1>
        <p className="text-gray-600 mb-6">
          Choose how you’d like to get started:
        </p>

        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => router.push('/register/company')}>
            Register as Company
          </Button>
          <Button variant="secondary" onClick={() => router.push('/register/job-seeker')}>
            Register as Job Seeker
          </Button>
        </div>
      </Card>
    </div>
  );
}
