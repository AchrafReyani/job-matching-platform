'use client';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 text-sm py-4 text-center">
      © {new Date().getFullYear()} JobMatch. All rights reserved.
    </footer>
  );
}
