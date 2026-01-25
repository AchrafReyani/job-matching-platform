interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
}

export default function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <p className="text-[var(--color-text)]">
      <strong>{label}:</strong> {value ?? '—'}
    </p>
  );
}
