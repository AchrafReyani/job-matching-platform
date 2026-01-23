'use client';

import type { ConversationSummary } from '@/lib/messages/types';

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const formattedTime = conversation.lastMessageAt
    ? formatRelativeTime(new Date(conversation.lastMessageAt))
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-(--color-muted) hover:bg-(--color-accent) transition-colors ${
        isActive ? 'bg-(--color-accent)' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-(--color-text) truncate">
              {conversation.otherPartyName}
            </h3>
            {conversation.unreadCount > 0 && (
              <span className="bg-(--color-primary) text-(--color-on-primary) text-xs font-bold px-2 py-0.5 rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-(--color-muted) truncate">
            {conversation.vacancyTitle}
          </p>
          {conversation.lastMessageText && (
            <p
              className={`text-sm mt-1 truncate ${
                conversation.unreadCount > 0
                  ? 'text-(--color-text) font-medium'
                  : 'text-(--color-muted)'
              }`}
            >
              {conversation.lastMessageText}
            </p>
          )}
        </div>
        {formattedTime && (
          <span className="text-xs text-(--color-muted) whitespace-nowrap">
            {formattedTime}
          </span>
        )}
      </div>
    </button>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}
