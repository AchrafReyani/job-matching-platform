import {
  Message,
  Application,
  JobSeeker,
  User,
  Vacancy,
  Company,
} from '@prisma/client';

export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'email' | 'role'>;
};

export type ApplicationWithParticipants = Application & {
  jobSeeker: JobSeeker & {
    user: User;
  };
  vacancy: Vacancy & {
    company: Company & {
      user: User;
    };
  };
};

export interface ConversationSummary {
  applicationId: number;
  vacancyTitle: string;
  otherPartyName: string;
  otherPartyUserId: string;
  lastMessageText: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
}

export interface MessageRepository {
  create(
    applicationId: number,
    senderId: string,
    messageText: string,
  ): Promise<Message>;
  findByApplicationId(applicationId: number): Promise<MessageWithSender[]>;
  findApplicationWithParticipants(
    applicationId: number,
  ): Promise<ApplicationWithParticipants | null>;
  markMessagesAsRead(applicationId: number, readerId: string): Promise<number>;
  getConversationsWithUnreadCount(userId: string): Promise<ConversationSummary[]>;
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository');
