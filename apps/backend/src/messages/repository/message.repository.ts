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

export interface MessageRepository {
  create(applicationId: number, senderId: string, messageText: string): Promise<Message>;
  findByApplicationId(applicationId: number): Promise<MessageWithSender[]>;
  findApplicationWithParticipants(applicationId: number): Promise<ApplicationWithParticipants | null>;
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository');
