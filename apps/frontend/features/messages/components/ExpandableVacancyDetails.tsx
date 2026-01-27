'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getVacancyById } from '@/lib/vacancies/api';
import type { Vacancy } from '@/lib/vacancies/types';

interface ExpandableVacancyDetailsProps {
  vacancyId: number;
  vacancyTitle: string;
}

export function ExpandableVacancyDetails({
  vacancyId,
  vacancyTitle,
}: ExpandableVacancyDetailsProps) {
  const t = useTranslations('Messages.vacancyDetails');
  const [isExpanded, setIsExpanded] = useState(false);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && !vacancy && !loading) {
      setLoading(true);
      setError(null);
      getVacancyById(vacancyId)
        .then((data) => {
          setVacancy(data);
        })
        .catch(() => {
          setError(t('loadError'));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isExpanded, vacancy, vacancyId, loading, t]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={toggleExpand}
        className="flex items-center gap-1 text-sm text-(--color-muted) hover:text-(--color-text) transition-colors"
      >
        <span>{vacancyTitle}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 p-3 bg-(--color-bg) rounded-lg border border-(--color-border)">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-(--color-muted)">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-(--color-primary)" />
              <span>{t('loading')}</span>
            </div>
          ) : error ? (
            <p className="text-sm text-(--color-error-dark)">{error}</p>
          ) : vacancy ? (
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-(--color-muted) uppercase">
                  {t('role')}
                </span>
                <p className="text-sm text-(--color-text)">{vacancy.role}</p>
              </div>

              {vacancy.salaryRange && (
                <div>
                  <span className="text-xs font-medium text-(--color-muted) uppercase">
                    {t('salary')}
                  </span>
                  <p className="text-sm text-(--color-text)">{vacancy.salaryRange}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-medium text-(--color-muted) uppercase">
                  {t('description')}
                </span>
                <p className="text-sm text-(--color-text) whitespace-pre-wrap line-clamp-4">
                  {vacancy.jobDescription}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
