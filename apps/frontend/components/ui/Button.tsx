'use client';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-lg font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent',
    destructive: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    outline:
      'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
