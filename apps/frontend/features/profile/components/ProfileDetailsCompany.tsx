import ProfileField from '@/components/common/ProfileField';
import type { ProfileResponse } from '@/lib/auth/types';

export default function ProfileDetailsCompany({ profile }: { profile: ProfileResponse }) {
  const company = profile.company;

  if (!company) return <p>No company profile found.</p>;

  return (
    <div className="space-y-3">
      <ProfileField label="Email" value={profile.email} />
      <ProfileField
        label="Created At"
        value={new Date(profile.createdAt).toLocaleString()}
      />

      <div className="mt-4 border-t border-(--color-muted) pt-3">
        <h2 className="font-semibold text-lg mb-2 text-[var(--color-text)]">Company Info</h2>

        <ProfileField label="Company Name" value={company.companyName} />

        {company.websiteUrl && (
          <p className="text-[var(--color-text)]">
            <strong>Website:</strong>{' '}
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-primary) underline"
            >
              {company.websiteUrl}
            </a>
          </p>
        )}

        {company.description && (
          <ProfileField label="Description" value={company.description} />
        )}
      </div>
    </div>
  );
}
