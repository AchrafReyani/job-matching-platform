'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/features/auth/components/AuthGuard";
import ProfileCardLayout from "@/features/profile/components/ProfileCardLayout";
import ProfileActionButtons from "@/features/profile/components/ProfileActionButtons";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getProfile, updateProfile } from "@/lib/auth/api";
import ProfileFormJobSeeker from "@/features/profile/components/ProfileFormJobSeeker";
import { getToken } from "@/lib/api";

export default function EditJobSeekerProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return router.push("/login");

    (async () => {
      try {
        const profile = await getProfile();
        if (profile.role !== "JOB_SEEKER") return router.push("/dashboard/company");

        setFullName(profile.jobSeeker?.fullName || "");
        setPortfolioUrl(profile.jobSeeker?.portfolioUrl || "");
        setExperienceSummary(profile.jobSeeker?.experienceSummary || "");
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({ fullName, portfolioUrl, experienceSummary });
      setMessage("✅ Profile updated!");
    } catch {
      setMessage("❌ Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthGuard allowedRole="JOB_SEEKER">
      <ProfileCardLayout title="Edit Profile">
        <ProfileFormJobSeeker
          fullName={fullName}
          setFullName={setFullName}
          portfolioUrl={portfolioUrl}
          setPortfolioUrl={setPortfolioUrl}
          experienceSummary={experienceSummary}
          setExperienceSummary={setExperienceSummary}
        />

        {message && <p className="text-sm text-center pt-2">{message}</p>}

        <ProfileActionButtons
          left={{ label: "Back", onClick: () => router.push("/dashboard/job-seeker/profile") }}
          right={{
            label: saving ? "Saving..." : "Save Changes",
            onClick: handleSave,
            disabled: saving,
          }}
        />
      </ProfileCardLayout>
    </AuthGuard>
  );
}
