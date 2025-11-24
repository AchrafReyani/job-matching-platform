'use client';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-lg font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1';

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
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
