'use client';

export function Footer() {
  return (
    <footer
      className="
        py-4 text-center text-sm
        bg-[var(--color-bg)]
        text-[var(--color-muted)]
        border-t border-[var(--color-muted)]
      "
    >
      © {new Date().getFullYear()} JobMatch. All rights reserved.
    </footer>
  );
}
