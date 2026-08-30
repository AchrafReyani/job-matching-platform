'use client';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const spinnerSizes = {
    sm: 'h-3.5 w-3.5 border-2',
    md: 'h-4 w-4 border-2',
    lg: 'h-5 w-5 border-2',
  };

  const variants = {
    primary: `
      bg-[var(--color-primary)]
      text-[var(--color-bg)]
      hover:bg-[var(--color-accent)]
      border-transparent
    `,
    secondary: `
      bg-[var(--color-secondary)]
      text-[var(--color-text)]
      hover:bg-[var(--color-accent)]
      border-transparent
    `,
    destructive: `
      bg-red-600 text-[var(--color-bg)]
      hover:bg-red-700
      border-transparent
    `,
    outline: `
      bg-transparent
      text-[var(--color-primary)]
      border-[var(--color-primary)]
      hover:bg-[var(--color-accent)]
      hover:text-[var(--color-bg)]
    `,
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <span
          className={`animate-spin rounded-full border-solid border-current border-t-transparent shrink-0 ${spinnerSizes[size]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
