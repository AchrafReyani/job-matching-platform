'use client';

import { Github } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer
      className="
        py-4 flex flex-col items-center gap-2
        bg-(--color-bg)
        text-(--color-muted)
        border-t border-(--color-muted)
      "
    >
      <p className="text-sm">
        {t('copyright', { year: new Date().getFullYear() })}
      </p>

      <a
        href="https://github.com/achrafreyani/job-matching-platform"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-(--color-muted) hover:text-(--color-text) transition"
      >
        <Github size={18} />
        <span className="text-sm">{t('github')}</span>
      </a>
    </footer>
  );
}
