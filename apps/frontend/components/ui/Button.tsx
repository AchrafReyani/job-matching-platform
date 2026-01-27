'use client';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base =
    'rounded-lg font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
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
      {...props}
    />
  );
}
