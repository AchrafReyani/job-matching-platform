'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const t = useTranslations('Messages');
  const tCommon = useTranslations('Common');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-(--color-primary) bg-(--color-bg) text-(--color-text)"
        placeholder={t('typeMessage')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
      />
      <Button onClick={handleSend} disabled={disabled || sending || !message.trim()}>
        {sending ? tCommon('sending') : tCommon('send')}
      </Button>
    </div>
  );
}
