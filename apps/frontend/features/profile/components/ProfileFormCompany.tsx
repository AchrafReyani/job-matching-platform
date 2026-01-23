'use client';

import { useTranslations } from 'next-intl';
import ProfileFieldEditable from "@/components/common/ProfileFieldEditable";

interface Props {
  companyName: string;
  setCompanyName: (v: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export default function ProfileFormCompany({
  companyName,
  setCompanyName,
  websiteUrl,
  setWebsiteUrl,
  description,
  setDescription,
}: Props) {
  const t = useTranslations('Profile.form');

  return (
    <div className="space-y-3">
      <ProfileFieldEditable
        label={t('companyName')}
        value={companyName}
        onChange={setCompanyName}
      />

      <ProfileFieldEditable
        label={t('websiteUrl')}
        value={websiteUrl}
        onChange={setWebsiteUrl}
      />

      <ProfileFieldEditable
        label={t('description')}
        value={description}
        onChange={setDescription}
        textarea
      />
    </div>
  );
}
