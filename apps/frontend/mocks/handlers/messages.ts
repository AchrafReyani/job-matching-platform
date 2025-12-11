import { http, HttpResponse } from 'msw';
import type { ChatMessageList, CreatedMessage } from '../../lib/messages/types';

export const messagesHandlers = [
  http.post('/messages', async (req) => {
    const body = (await req.request.json()) as {
      applicationId: number;
      messageText: string;
    };

    const createdMessage: CreatedMessage = {
      id: 1,
      applicationId: body.applicationId,
      senderId: 'user-123',
      messageText: body.messageText,
      sentAt: new Date().toISOString(),
    };

    return HttpResponse.json(createdMessage);
  }),

  http.get('/messages/:applicationId', (req) => {
    const applicationId = Number(req.params.applicationId);

    const mockMessages: ChatMessageList = [
      {
        id: 1,
        applicationId,
        senderId: 'user-123',
        messageText: 'Hello!',
        sentAt: new Date().toISOString(),
        sender: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'JOB_SEEKER',
        },
      },
      {
        id: 2,
        applicationId,
        senderId: 'company-456',
        messageText: 'Hi there!',
        sentAt: new Date().toISOString(),
        sender: {
          id: 'company-456',
          email: 'company@example.com',
          role: 'COMPANY',
        },
      },
    ];

    return HttpResponse.json(mockMessages);
  }),
];
