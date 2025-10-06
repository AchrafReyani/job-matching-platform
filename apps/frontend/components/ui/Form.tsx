'use client';
import { ReactNode } from 'react';

export function Form({ children, onSubmit }: { children: ReactNode; onSubmit: React.FormEventHandler }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      {children}
    </form>
  );
}
