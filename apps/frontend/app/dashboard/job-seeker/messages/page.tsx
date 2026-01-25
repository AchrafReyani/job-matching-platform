'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/layout/Sidebar';
import LoadingScreen from '@/components/common/LoadingScreen';
import type { ConversationSummary } from '@/lib/messages/types';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth/api';
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
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const user = useCurrentUser();
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations();
  const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useChat(activeConversation?.applicationId ?? null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getProfile();
        if (profile.role !== 'JOB_SEEKER') {
          router.push('/dashboard/company/messages');
          return;
        }
        setUserName(profile.jobSeeker?.fullName || 'Job Seeker');
      } catch {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSelectConversation = (conversation: ConversationSummary) => {
    setActiveConversation(conversation);
    refetchConversations();
  };

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText);
    refetchConversations();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-[var(--color-bg)] flex">
      <Sidebar role="JOB_SEEKER" userName={userName} />

      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-secondary)]">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel - Conversation list */}
          <div className="w-1/3 border-r border-[var(--color-secondary)] bg-[var(--color-bg)]">
            <ConversationList
              conversations={conversations}
              activeApplicationId={activeConversation?.applicationId ?? null}
              onSelectConversation={handleSelectConversation}
              loading={conversationsLoading}
              error={conversationsError}
            />
          </div>

          {/* Right panel - Active chat */}
          <div className="w-2/3 flex flex-col">
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
    </div>
  );
}
