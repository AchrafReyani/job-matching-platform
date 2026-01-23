'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => handleChange(loc.code)}
          disabled={isPending || locale === loc.code}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc.code
              ? 'bg-(--color-primary) text-(--color-bg) font-semibold'
              : 'text-(--color-text) hover:bg-(--color-accent)'
          } ${isPending ? 'opacity-50' : ''}`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
