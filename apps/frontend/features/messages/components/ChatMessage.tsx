'use client';

import type { ChatMessage as ChatMessageType } from '@/lib/messages/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
          isOwnMessage
            ? 'bg-(--color-primary) text-(--color-on-primary) rounded-br-none'
            : 'bg-(--color-secondary) text-(--color-text) rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.messageText}</p>
        <p
          className={`text-xs mt-1 ${
            isOwnMessage
              ? 'text-(--color-on-primary) text-right'
              : 'text-(--color-text) text-left'
          }`}
        >
          {new Date(message.sentAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
