import { authRequest } from '@/lib/api';
import type {
  CreateMessagePayload,
  CreatedMessage,
  ChatMessageList,
  ConversationSummary,
  MarkAsReadResponse,
} from './types';

/**
 * POST /messages
 */
export async function sendMessage(
  payload: CreateMessagePayload
): Promise<CreatedMessage> {
  return authRequest<CreatedMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * GET /messages/conversations
 */
export async function getConversations(): Promise<ConversationSummary[]> {
  return authRequest<ConversationSummary[]>('/messages/conversations', {
    method: 'GET',
  });
}

/**
 * GET /messages/:applicationId
 */
export async function getMessages(
  applicationId: number
): Promise<ChatMessageList> {
  return authRequest<ChatMessageList>(`/messages/${applicationId}`, {
    method: 'GET',
  });
}

/**
 * PATCH /messages/:applicationId/read
 */
export async function markMessagesAsRead(
  applicationId: number
): Promise<MarkAsReadResponse> {
  return authRequest<MarkAsReadResponse>(`/messages/${applicationId}/read`, {
    method: 'PATCH',
  });
}
