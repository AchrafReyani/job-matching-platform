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
  return (
    <div className="space-y-3">
      <ProfileFieldEditable
        label="Full Name"
        value={fullName}
        onChange={setFullName}
      />

      <ProfileFieldEditable
        label="Portfolio URL"
        value={portfolioUrl}
        onChange={setPortfolioUrl}
      />

      <ProfileFieldEditable
        label="Experience Summary"
        value={experienceSummary}
        onChange={setExperienceSummary}
        textarea
      />
    </div>
  );
}
