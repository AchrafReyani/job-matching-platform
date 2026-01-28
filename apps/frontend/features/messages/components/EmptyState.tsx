'use client';

// Re-export from common EmptyState for backward compatibility
import { EmptyState as CommonEmptyState } from '@/components/common/EmptyState';

interface MessagesEmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: MessagesEmptyStateProps) {
  return (
    <CommonEmptyState
      icon="💬"
      title={title}
      description={description}
      className="h-full"
    />
  );
}
