'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

export interface VacancySummary {
  id: number;
  title: string;
  role: string;
  jobDescription: string;
  salaryRange?: string | null;
  createdAt: string | Date;
}

interface VacancyCardProps {
  vacancy: VacancySummary;
  variant?: 'default' | 'compact';
  showDescription?: boolean;
  showDate?: boolean;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export function VacancyCard({
  vacancy,
  variant = 'default',
  showDescription = true,
  showDate = true,
  onClick,
  actionButton,
}: VacancyCardProps) {
  const t = useTranslations('Vacancies.card');

  const formattedDate =
    typeof vacancy.createdAt === 'string'
      ? new Date(vacancy.createdAt).toLocaleDateString()
      : vacancy.createdAt.toLocaleDateString();

  const isCompact = variant === 'compact';

  const content = (
    <>
      <div className="flex justify-between items-start">
        <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
          <h3
            className={`font-semibold text-[var(--color-text)] ${
              isCompact ? 'text-base' : 'text-lg'
            }`}
          >
            {vacancy.title}
          </h3>
          <p
            className={`text-[var(--color-text)] ${
              isCompact ? 'text-sm opacity-80' : ''
            }`}
          >
            <span className="font-medium">{t('role')}:</span> {vacancy.role}
          </p>
          {vacancy.salaryRange && (
            <p
              className={`text-[var(--color-text)] ${
                isCompact ? 'text-sm opacity-80' : ''
              }`}
            >
              <span className="font-medium">{t('salary')}:</span>{' '}
              {vacancy.salaryRange}
            </p>
          )}
        </div>
        {actionButton && <div className="flex-shrink-0 ml-4">{actionButton}</div>}
      </div>

      {showDescription && !isCompact && (
        <p className="text-[var(--color-text)] mt-3 line-clamp-3">
          {vacancy.jobDescription}
        </p>
      )}

      {showDate && (
        <p
          className={`text-[var(--color-text)] opacity-60 ${
            isCompact ? 'text-xs mt-1' : 'text-sm mt-2'
          }`}
        >
          {t('posted')}: {formattedDate}
        </p>
      )}
    </>
  );

  if (onClick) {
    return (
      <Card
        className={`${isCompact ? 'p-3' : 'p-4'} cursor-pointer hover:shadow-lg transition-shadow`}
      >
        <button
          onClick={onClick}
          className="w-full text-left"
          type="button"
        >
          {content}
        </button>
      </Card>
    );
  }

  return <Card className={isCompact ? 'p-3' : 'p-4'}>{content}</Card>;
}
