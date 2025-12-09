'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/features/auth/components/AuthGuard";
import ProfileCardLayout from "@/features/profile/components/ProfileCardLayout";
import ProfileActionButtons from "@/features/profile/components/ProfileActionButtons";
import LoadingScreen from "@/components/common/LoadingScreen";
import ProfileFormCompany from "@/features/profile/components/ProfileFormCompany";
import { getToken } from "@/lib/api";
import { getProfile, updateProfile } from "@/lib/auth/api";

export default function EditCompanyProfilePage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return router.push("/login");

    const load = async () => {
      try {
        const data = await getProfile();
        if (data.role !== "COMPANY") return router.push("/dashboard/job-seeker");

        setCompanyName(data.company?.companyName || "");
        setWebsiteUrl(data.company?.websiteUrl || "");
        setDescription(data.company?.description || "");
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({ companyName, websiteUrl, description });
      setMessage("✅ Profile updated!");
    } catch {
      setMessage("❌ Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthGuard allowedRole="COMPANY">
      <ProfileCardLayout title="Edit Company Profile">
        <ProfileFormCompany
          companyName={companyName}
          setCompanyName={setCompanyName}
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          description={description}
          setDescription={setDescription}
        />

        {message && <p className="text-center text-sm pt-2">{message}</p>}

        <ProfileActionButtons
          left={{
            label: "Back",
            onClick: () => router.push("/dashboard/company/profile"),
          }}
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
