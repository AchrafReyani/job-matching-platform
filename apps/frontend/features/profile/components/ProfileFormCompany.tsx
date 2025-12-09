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
  return (
    <div className="space-y-3">
      <ProfileFieldEditable
        label="Company Name"
        value={companyName}
        onChange={setCompanyName}
      />

      <ProfileFieldEditable
        label="Website URL"
        value={websiteUrl}
        onChange={setWebsiteUrl}
      />

      <ProfileFieldEditable
        label="Description"
        value={description}
        onChange={setDescription}
        textarea
      />
    </div>
  );
}
