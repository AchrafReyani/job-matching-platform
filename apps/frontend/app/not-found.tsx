'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg) text-(--color-text) p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-(--color-primary) mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-(--color-muted) mb-8 max-w-md">
          The page you are looking for does not exist or you do not have access to it.
        </p>
        <Button onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
