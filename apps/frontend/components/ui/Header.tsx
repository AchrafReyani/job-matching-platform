'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const router = useRouter();
  const t = useTranslations('Header');

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
        <LanguageSwitcher />
        <ThemeToggle />
      </nav>
    </header>
  );
}
