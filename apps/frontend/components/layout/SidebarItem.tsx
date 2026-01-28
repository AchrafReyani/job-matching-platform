'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  showDot?: boolean;
}

export function SidebarItem({ href, icon, label, badge, showDot }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${
          isActive
            ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
            : 'text-[var(--color-text)] hover:bg-[var(--color-secondary)]'
        }
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`
            min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
            ${isActive ? 'bg-[var(--color-bg)] text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-[var(--color-bg)]'}
          `}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {showDot && (
        <span
          className={`
            w-2 h-2 rounded-full
            ${isActive ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-primary)]'}
          `}
        />
      )}
    </Link>
  );
}
