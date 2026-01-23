'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessages, sendMessage, markMessagesAsRead } from '@/lib/messages/api';
import type { ChatMessage } from '@/lib/messages/types';

const POLLING_INTERVAL = 5000; // 5 seconds

export function useChat(applicationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!applicationId) return;

    try {
      const data = await getMessages(applicationId);
      setMessages(data);
      setError(null);

      // Mark messages as read when we fetch them
      await markMessagesAsRead(applicationId);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMessages();

    const interval = setInterval(fetchMessages, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [applicationId, fetchMessages]);

  const send = useCallback(
    async (messageText: string) => {
      if (!applicationId) return;

      try {
        await sendMessage({ applicationId, messageText });
        await fetchMessages();
      } catch (err) {
        console.error('Failed to send message:', err);
        throw err;
      }
    },
    [applicationId, fetchMessages]
  );

  return {
    messages,
    loading,
    error,
    sendMessage: send,
    refetch: fetchMessages,
  };
}
