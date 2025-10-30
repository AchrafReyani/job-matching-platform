'use client';

import { useRouter } from 'next/navigation';
import { Button } from './Button';

export function Header() {
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <h1
        className="text-lg font-semibold text-gray-800 cursor-pointer"
        onClick={() => router.push('/')}
      >
        JobMatch
      </h1>

      <nav className="flex gap-3">
        {/* <Button
          variant="secondary"
          className="text-sm px-3 py-1"
          onClick={() => router.push('/dashboard/job-seeker')}
        >
          Job Seeker
        </Button>
        <Button
          variant="secondary"
          className="text-sm px-3 py-1"
          onClick={() => router.push('/dashboard/company')}
        >
          Company
        </Button> */}
        <Button
          variant="destructive"
          className="text-sm px-3 py-1"
          onClick={() => router.push('/logout')}
        >
          Logout
        </Button>
      </nav>
    </header>
  );
}
