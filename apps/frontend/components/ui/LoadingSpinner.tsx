'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-[var(--color-primary)] ${sizeClasses[size]} ${className}`}
    />
  );
}

interface LoadingContainerProps {
  children?: React.ReactNode;
}

export function LoadingContainer({ children }: LoadingContainerProps) {
  return (
    <div className="flex justify-center py-10">
      {children ?? <LoadingSpinner />}
    </div>
  );
}
