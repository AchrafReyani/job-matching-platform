'use client';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-6xl mb-4">💬</div>
      <h2 className="text-xl font-semibold text-(--color-text) mb-2">{title}</h2>
      <p className="text-(--color-muted)">{description}</p>
    </div>
  );
}
