'use client';

import { useTranslations } from 'next-intl';
import ProfileFieldEditable from '@/components/common/ProfileFieldEditable';

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (v: string) => void;
  experienceSummary: string;
  setExperienceSummary: (v: string) => void;
}

export default function ProfileFormJobSeeker({
  fullName,
  setFullName,
  portfolioUrl,
  setPortfolioUrl,
  experienceSummary,
  setExperienceSummary,
}: Props) {
  const t = useTranslations('Profile.form');

  return (
    <div className="space-y-3">
      <ProfileFieldEditable
        label={t('fullName')}
        value={fullName}
        onChange={setFullName}
      />

      <ProfileFieldEditable
        label={t('portfolioUrl')}
        value={portfolioUrl}
        onChange={setPortfolioUrl}
      />

      <ProfileFieldEditable
        label={t('experienceSummary')}
        value={experienceSummary}
        onChange={setExperienceSummary}
        textarea
      />
    </div>
  );
}
