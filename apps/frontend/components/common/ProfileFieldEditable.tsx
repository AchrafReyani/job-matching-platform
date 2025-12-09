interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}

export default function ProfileFieldEditable({
  label,
  value,
  onChange,
  textarea,
}: Props) {
  const Input = textarea ? "textarea" : "input";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-(--color-text)">
        {label}
      </label>

      <Input
        value={value}
        onChange={handleChange}
        rows={textarea ? 4 : undefined}
        className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text)"
      />
    </div>
  );
}
