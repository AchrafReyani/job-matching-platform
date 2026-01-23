'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { ConversationSummary } from '@/lib/messages/types';
import {
  ConversationList,
  ChatPanel,
  useCurrentUser,
  useConversations,
  useChat,
} from '@/features/messages';

export default function JobSeekerMessagesPage() {
  const router = useRouter();
  const t = useTranslations('Messages');
  const tCommon = useTranslations('Common');
  const user = useCurrentUser();
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations();
  const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useChat(activeConversation?.applicationId ?? null);

  const handleSelectConversation = (conversation: ConversationSummary) => {
    setActiveConversation(conversation);
    // Refetch conversations to update unread counts
    refetchConversations();
  };

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText);
    refetchConversations();
  };

  return (
    <div className="h-screen bg-(--color-bg) flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-(--color-muted) bg-(--color-secondary)">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-(--color-text)">{t('title')}</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/job-seeker')}
          >
            {tCommon('backToDashboard')}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left panel - Conversation list */}
        <div className="w-1/3 border-r border-(--color-muted) bg-(--color-secondary)">
          <ConversationList
            conversations={conversations}
            activeApplicationId={activeConversation?.applicationId ?? null}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
            error={conversationsError}
          />
        </div>

        {/* Right panel - Active chat */}
        <div className="w-2/3 p-4">
          <ChatPanel
            conversation={activeConversation}
            messages={messages}
            currentUserId={user?.userId ?? null}
            loading={messagesLoading}
            error={messagesError}
            onSendMessage={handleSendMessage}
            userRole="JOB_SEEKER"
          />
        </div>
      </div>
    </div>
  );
}
