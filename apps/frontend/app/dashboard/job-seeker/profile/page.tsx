'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import AuthGuard from "@/features/auth/components/AuthGuard";
import ProfileCardLayout from "@/features/profile/components/ProfileCardLayout";
import ProfileDetailsJobSeeker from "@/features/profile/components/ProfileDetailsJobSeeker";
import ProfileActionButtons from "@/features/profile/components/ProfileActionButtons";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getProfile } from "@/lib/auth/api";
import { getToken } from "@/lib/api";
import type { ProfileResponse } from "@/lib/auth/types";

export default function DashboardJobSeekerProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Profile.jobSeeker');
  const tCommon = useTranslations('Common');

  // Load profile (since this page *shows* details, not AuthGuard)
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
    <AuthGuard allowedRole="JOB_SEEKER">
      <ProfileCardLayout title={t('title')}>
        {profile && (
          <>
            <ProfileDetailsJobSeeker profile={profile} />

            <ProfileActionButtons
              left={{
                label: tCommon('backToDashboard'),
                onClick: () => router.push("/dashboard/job-seeker"),
              }}
              right={{
                label: t('editProfile'),
                onClick: () => router.push("/dashboard/job-seeker/profile/edit"),
              }}
            />
          </>
        )}
      </ProfileCardLayout>
    </AuthGuard>
  );
}
