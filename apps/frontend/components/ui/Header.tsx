'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { getToken } from '@/lib/api';
import { logout } from '@/lib/auth/logout';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const router = useRouter();
  const t = useTranslations('Header');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateLoginState = () => setIsLoggedIn(!!getToken());
    updateLoginState();

    window.addEventListener('tokenChanged', updateLoginState);
    return () => window.removeEventListener('tokenChanged', updateLoginState);
  }, []);

  return (
    <header
      className="
        px-6 py-3 flex justify-between items-center
        bg-(--color-bg)
        text-(--color-text)
        shadow-(--shadow-header)
        border-b border-(--color-muted)
      "
    >
      {/* Logo / Title */}
      <h1
        className="text-lg font-semibold cursor-pointer text-(--color-primary)"
        onClick={() => router.push('/')}
      >
        {t('title')}
      </h1>

      {/* Right-side nav */}
      <nav className="flex items-center gap-3">
        {isLoggedIn && (
          <Button
            variant="destructive"
            className="text-sm px-3 py-1"
            onClick={logout}
          >
            {t('logout')}
          </Button>
        )}

        <LanguageSwitcher />
        <ThemeToggle />
      </nav>
    </header>
  );
}
