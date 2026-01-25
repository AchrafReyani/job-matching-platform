'use client';

import { useTranslations } from 'next-intl';
import type { ConversationSummary } from '@/lib/messages/types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeApplicationId: number | null;
  onSelectConversation: (conversation: ConversationSummary) => void;
  loading: boolean;
  error: string | null;
}

export function ConversationList({
  conversations,
  activeApplicationId,
  onSelectConversation,
  loading,
  error,
}: ConversationListProps) {
  const t = useTranslations('Messages');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-(--color-muted)">{t('loadingConversations')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-(--color-error-dark) text-center">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-(--color-muted) text-center">
          {t('noConversations')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.applicationId}
          conversation={conversation}
          isActive={conversation.applicationId === activeApplicationId}
          onClick={() => onSelectConversation(conversation)}
        />
      ))}
    </div>
  );
}
