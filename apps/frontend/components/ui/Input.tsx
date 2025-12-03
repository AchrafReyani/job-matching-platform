'use client';
import { useState } from 'react';
import { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Uses lucide icons (already in your project)

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="text-sm font-medium text-(--color-text)">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          className={`
            w-full
            border border-(--color-muted)
            rounded-lg px-3 py-2
            bg-(--color-bg)
            text-(--color-text)
            focus:ring-2 focus:ring-(--color-primary)
            outline-none
            ${isPassword ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              text-(--color-muted)
              hover:text-(--color-text)
            "
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
