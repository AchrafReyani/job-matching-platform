'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { ChatMessage as ChatMessageType } from '@/lib/messages/types';
import type { ConversationSummary } from '@/lib/messages/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';

interface ChatPanelProps {
  conversation: ConversationSummary | null;
  messages: ChatMessageType[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<void>;
  userRole: 'JOB_SEEKER' | 'COMPANY';
}

export function ChatPanel({
  conversation,
  messages,
  currentUserId,
  loading,
  error,
  onSendMessage,
  userRole,
}: ChatPanelProps) {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="h-full bg-(--color-secondary) rounded-lg">
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the list to start chatting"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-(--color-secondary) rounded-lg">
        <p className="text-(--color-muted)">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-(--color-secondary) rounded-lg">
        <p className="text-(--color-error-dark)">{error}</p>
      </div>
    );
  }

  const profileLabel = userRole === 'COMPANY' ? 'View Job Seeker Profile' : 'View Company Profile';

  return (
    <div className="flex flex-col h-full bg-(--color-secondary) rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-(--color-muted)">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-(--color-text)">
              {conversation.otherPartyName}
            </h2>
            <p className="text-sm text-(--color-muted)">
              {conversation.vacancyTitle}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/profiles/${conversation.otherPartyUserId}`)}
            className="text-(--color-primary) border-(--color-primary)"
          >
            {profileLabel}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-(--color-bg)">
        {messages.length === 0 ? (
          <p className="text-(--color-muted) text-center mt-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-(--color-muted)">
        <ChatInput onSend={onSendMessage} />
      </div>
    </div>
  );
}
