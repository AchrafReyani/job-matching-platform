'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title?: string;
  value?: number | string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export function StatCardSkeleton() {
  return (
    <div
      data-testid="stat-card-skeleton"
      className="bg-[var(--color-bg)] rounded-xl p-6 border-l-4 border-[var(--color-secondary)] shadow-sm animate-pulse"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-[var(--color-secondary)] rounded" />
          <div className="h-8 w-16 bg-[var(--color-secondary)] rounded mt-1" />
        </div>
        <div className="w-12 h-12 rounded-lg bg-[var(--color-secondary)] flex-shrink-0" />
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  icon,
  variant = 'default',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const variantStyles = {
    default: 'border-[var(--color-secondary)]',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    danger: 'border-red-500',
  };

  const iconVariantStyles = {
    default: 'bg-[var(--color-secondary)] text-[var(--color-text)]',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
  };

  return (
    <div
      data-testid="stat-card"
      className={`
        bg-[var(--color-bg)] rounded-xl p-6 border-l-4 shadow-sm
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text)] opacity-70">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-text)] mt-1">{value}</p>
        </div>
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${iconVariantStyles[variant]}
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
