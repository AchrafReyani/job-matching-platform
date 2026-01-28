'use client';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

/**
 * Get the appropriate variant for application statuses
 */
export function getApplicationStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'APPLIED':
    default:
      return 'warning';
  }
}

export function StatusBadge({
  status,
  label,
  variant,
  className = '',
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? getApplicationStatusVariant(status);

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${variantClasses[resolvedVariant]} ${className}`}
    >
      {label}
    </span>
  );
}
