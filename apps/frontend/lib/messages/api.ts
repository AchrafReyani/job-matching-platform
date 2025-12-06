import { authRequest } from '@/lib/api';
import type {
  CreateMessagePayload,
  CreatedMessage,
  ChatMessageList,
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
 * GET /messages/:applicationId
 */
export async function getMessages(
  applicationId: number
): Promise<ChatMessageList> {
  return authRequest<ChatMessageList>(`/messages/${applicationId}`, {
    method: 'GET',
  });
}
