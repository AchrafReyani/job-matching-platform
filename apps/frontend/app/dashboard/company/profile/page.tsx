'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import AuthGuard from "@/features/auth/components/AuthGuard";
import ProfileCardLayout from "@/features/profile/components/ProfileCardLayout";
import ProfileDetailsCompany from "@/features/profile/components/ProfileDetailsCompany";
import ProfileActionButtons from "@/features/profile/components/ProfileActionButtons";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getToken } from "@/lib/api";
import { getProfile } from "@/lib/auth/api";
import type { ProfileResponse } from "@/lib/auth/types";

export default function DashboardCompanyProfilePage() {
  const router = useRouter();
  const t = useTranslations('Profile.company');
  const tCommon = useTranslations('Common');
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <LoadingScreen />;

  return (
    <AuthGuard allowedRole="COMPANY">
      <ProfileCardLayout title={t('title')}>
        {profile && (
          <>
            <ProfileDetailsCompany profile={profile} />

            <ProfileActionButtons
              left={{
                label: tCommon('backToDashboard'),
                onClick: () => router.push("/dashboard/company"),
              }}
              right={{
                label: t('editProfile'),
                onClick: () => router.push("/dashboard/company/profile/edit"),
              }}
            />
          </>
        )}
      </ProfileCardLayout>
    </AuthGuard>
  );
}
