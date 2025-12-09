import { Card } from '@/components/ui/Card';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ProfileCardLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 space-y-4 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
        {children}
      </Card>
    </div>
  );
}
