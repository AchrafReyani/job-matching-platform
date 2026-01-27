'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';

export function AppearanceSection() {
  const t = useTranslations('Settings.appearance');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          {t('title')}
        </h2>
        <div className="h-12 animate-pulse bg-[var(--color-secondary)] rounded" />
      </div>
    );
  }

  const themes = [
    { id: 'light', label: t('light'), icon: Sun },
    { id: 'dark', label: t('dark'), icon: Moon },
    { id: 'system', label: t('system'), icon: Monitor },
  ];

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {t('title')}
      </h2>

      <div className="flex gap-3">
        {themes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
              ${
                theme === id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]'
                  : 'border-[var(--color-secondary)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
