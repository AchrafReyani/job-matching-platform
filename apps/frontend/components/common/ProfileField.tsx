interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
}

export default function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <p>
      <strong>{label}:</strong> {value ?? '—'}
    </p>
  );
}
