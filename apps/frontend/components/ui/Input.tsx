'use client';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input
        className={`
          border border-[var(--color-muted)]
          rounded-lg px-3 py-2
          bg-[var(--color-bg)]
          text-[var(--color-text)]
          focus:ring-2 focus:ring-[var(--color-primary)]
          outline-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
