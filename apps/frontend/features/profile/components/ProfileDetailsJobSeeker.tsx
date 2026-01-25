import ProfileField from "@/components/common/ProfileField";
import type { ProfileResponse } from "@/lib/auth/types";

export default function ProfileDetailsJobSeeker({ profile }: { profile: ProfileResponse }) {
  const js = profile.jobSeeker;

  if (!js) return <p className="text-(--color-muted)">No job seeker profile found.</p>;

  return (
    <div className="space-y-3">
      <ProfileField label="Email" value={profile.email} />
      <ProfileField
        label="Created At"
        value={new Date(profile.createdAt).toLocaleString()}
      />

      <div className="mt-4 border-t border-(--color-muted) pt-3">
        <h2 className="font-semibold text-lg mb-2 text-[var(--color-text)]">Job Seeker Info</h2>

        <ProfileField label="Name" value={js.fullName} />

        {js.portfolioUrl && (
          <p className="text-[var(--color-text)]">
            <strong>Portfolio:</strong>{" "}
            <a
              href={js.portfolioUrl}
              target="_blank"
              className="text-(--color-primary) underline"
            >
              {js.portfolioUrl}
            </a>
          </p>
        )}

        {js.experienceSummary && (
          <ProfileField label="Experience" value={js.experienceSummary} />
        )}
      </div>
    </div>
  );
}
