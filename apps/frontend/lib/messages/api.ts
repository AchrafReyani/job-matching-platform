import { request } from '@/lib/api';
import type {
  CreateMessagePayload,
  CreatedMessage,
  ChatMessageList,
} from './types';

/**
 * POST /messages
 * Create a new message inside an application chat.
 */
export async function sendMessage(
  payload: CreateMessagePayload
): Promise<CreatedMessage> {
  return request<CreatedMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * GET /messages/:applicationId
 * Fetch all messages for a given application (chat thread).
 */
export async function getMessages(
  applicationId: number
): Promise<ChatMessageList> {
  return request<ChatMessageList>(`/messages/${applicationId}`, {
    method: 'GET',
  });
}
