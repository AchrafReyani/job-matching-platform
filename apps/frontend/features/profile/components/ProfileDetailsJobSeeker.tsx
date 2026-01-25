'use client';

import { useTranslations } from 'next-intl';
import ProfileField from "@/components/common/ProfileField";
import type { ProfileResponse } from "@/lib/auth/types";

export default function ProfileDetailsJobSeeker({ profile }: { profile: ProfileResponse }) {
  const t = useTranslations('Profile.details');
  const js = profile.jobSeeker;

  if (!js) return <p className="text-[var(--color-text)] opacity-70">{t('noJobSeekerProfile')}</p>;

  return (
    <div className="space-y-3">
      <ProfileField label={t('email')} value={profile.email} />
      <ProfileField
        label={t('createdAt')}
        value={new Date(profile.createdAt).toLocaleString()}
      />

      <div className="mt-4 border-t border-[var(--color-secondary)] pt-3">
        <h2 className="font-semibold text-lg mb-2 text-[var(--color-text)]">{t('jobSeekerInfo')}</h2>

        <ProfileField label={t('name')} value={js.fullName} />

        {js.portfolioUrl && (
          <p className="text-[var(--color-text)]">
            <strong>{t('portfolio')}:</strong>{" "}
            <a
              href={js.portfolioUrl}
              target="_blank"
              className="text-[var(--color-primary)] underline"
            >
              {js.portfolioUrl}
            </a>
          </p>
        )}

        {js.experienceSummary && (
          <ProfileField label={t('experience')} value={js.experienceSummary} />
        )}
      </div>
    </div>
  );
}
