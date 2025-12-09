import { Button } from '@/components/ui/Button';

interface ButtonConfig {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface Props {
  left: ButtonConfig;
  right: ButtonConfig;
}

export default function ProfileActionButtons({ left, right }: Props) {
  return (
    <div className="flex justify-between mt-6">
      <Button
        onClick={left.onClick}
        disabled={left.disabled}
        className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
      >
        {left.label}
      </Button>

      <Button
        onClick={right.onClick}
        disabled={right.disabled}
        className="bg-(--color-accent) hover:bg-accent-dark text-(--color-on-primary)"
      >
        {right.label}
      </Button>
    </div>
  );
}
