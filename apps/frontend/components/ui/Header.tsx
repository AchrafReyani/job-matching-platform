'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { getToken, clearToken } from '@/lib/api';

export function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check token initially
    const updateLoginState = () => setIsLoggedIn(!!getToken());
    updateLoginState();

    // Listen for token changes (login/logout)
    window.addEventListener('tokenChanged', updateLoginState);
    return () => window.removeEventListener('tokenChanged', updateLoginState);
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push('/home');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <h1
        className="text-lg font-semibold text-gray-800 cursor-pointer"
        onClick={() => router.push('/')}
      >
        JobMatch
      </h1>

      <nav className="flex gap-3">
        {isLoggedIn && (
          <Button
            variant="destructive"
            className="text-sm px-3 py-1"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </nav>
    </header>
  );
}
