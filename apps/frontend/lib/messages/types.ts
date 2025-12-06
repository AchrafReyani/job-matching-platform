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
  sender: MessageSender;
}

/** Full array returned by GET */
export type ChatMessageList = ChatMessage[];
