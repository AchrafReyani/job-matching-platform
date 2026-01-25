'use client';

import { useTranslations } from 'next-intl';
import ProfileField from '@/components/common/ProfileField';
import type { ProfileResponse } from '@/lib/auth/types';

export default function ProfileDetailsCompany({ profile }: { profile: ProfileResponse }) {
  const t = useTranslations('Profile.details');
  const company = profile.company;

  if (!company) return <p className="text-[var(--color-text)] opacity-70">{t('noCompanyProfile')}</p>;

  return (
    <div className="space-y-3">
      <ProfileField label={t('email')} value={profile.email} />
      <ProfileField
        label={t('createdAt')}
        value={new Date(profile.createdAt).toLocaleString()}
      />

      <div className="mt-4 border-t border-[var(--color-secondary)] pt-3">
        <h2 className="font-semibold text-lg mb-2 text-[var(--color-text)]">{t('companyInfo')}</h2>

        <ProfileField label={t('companyName')} value={company.companyName} />

        {company.websiteUrl && (
          <p className="text-[var(--color-text)]">
            <strong>{t('website')}:</strong>{' '}
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] underline"
            >
              {company.websiteUrl}
            </a>
          </p>
        )}

        {company.description && (
          <ProfileField label={t('description')} value={company.description} />
        )}
      </div>
    </div>
  );
}
