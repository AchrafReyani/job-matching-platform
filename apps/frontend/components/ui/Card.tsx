'use client';
import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`
        bg-[var(--color-bg)] 
        rounded-2xl 
        shadow-[var(--shadow-header)] 
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
