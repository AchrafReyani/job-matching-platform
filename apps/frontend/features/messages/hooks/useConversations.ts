'use client';

import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '@/lib/messages/api';
import type { ConversationSummary } from '@/lib/messages/types';

const POLLING_INTERVAL = 10000; // 10 seconds

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    const interval = setInterval(fetchConversations, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
}
