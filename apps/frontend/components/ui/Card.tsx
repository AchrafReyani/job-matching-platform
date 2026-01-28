'use client';
import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-(--color-bg)
        rounded-2xl
        shadow-(--shadow-header)
        p-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
