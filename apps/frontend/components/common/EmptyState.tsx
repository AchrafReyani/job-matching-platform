'use client';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      {title && (
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">{title}</h2>
      )}
      <p className="text-[var(--color-text)] opacity-70">{description}</p>
    </div>
  );
}
