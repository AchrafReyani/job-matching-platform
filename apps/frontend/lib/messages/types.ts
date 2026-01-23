export interface CreateMessagePayload {
  applicationId: number;
  messageText: string;
}

/* ---------- RESPONSE TYPES ---------- */

/** Returned after creating a message */
export interface CreatedMessage {
  id: number;
  applicationId: number;
  senderId: string;
  messageText: string;
  sentAt: string; // ISO date
}

/** User data included inside each fetched message */
export interface MessageSender {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY';
}

/** Message returned in GET /messages/:applicationId */
export interface ChatMessage {
  id: number;
  applicationId: number;
  senderId: string;
  messageText: string;
  sentAt: string; // ISO date
  readAt: string | null; // ISO date or null if unread
  sender: MessageSender;
}

/** Full array returned by GET */
export type ChatMessageList = ChatMessage[];

/** Conversation summary with unread count */
export interface ConversationSummary {
  applicationId: number;
  vacancyTitle: string;
  otherPartyName: string;
  otherPartyUserId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null; // ISO date
  unreadCount: number;
}

/** Response from marking messages as read */
export interface MarkAsReadResponse {
  markedAsRead: number;
}
