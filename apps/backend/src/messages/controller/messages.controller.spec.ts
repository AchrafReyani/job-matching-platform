import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { CreateMessageUseCase } from '../usecase/create-message.usecase';
import { GetMessagesUseCase } from '../usecase/get-messages.usecase';
import { GetConversationsUseCase } from '../usecase/get-conversations.usecase';
import { MarkMessagesReadUseCase } from '../usecase/mark-messages-read.usecase';

describe('MessagesController', () => {
  let controller: MessagesController;
  const mockCreateMessageUseCase = { execute: jest.fn() };
  const mockGetMessagesUseCase = { execute: jest.fn() };
  const mockGetConversationsUseCase = { execute: jest.fn() };
  const mockMarkMessagesReadUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: CreateMessageUseCase, useValue: mockCreateMessageUseCase },
        { provide: GetMessagesUseCase, useValue: mockGetMessagesUseCase },
        {
          provide: GetConversationsUseCase,
          useValue: mockGetConversationsUseCase,
        },
        {
          provide: MarkMessagesReadUseCase,
          useValue: mockMarkMessagesReadUseCase,
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const mockMessage = { id: 1, messageText: 'Hello!' };
      mockCreateMessageUseCase.execute.mockResolvedValue(mockMessage);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const dto = { applicationId: 1, messageText: 'Hello!' };
      const result = await controller.create(req as never, dto);

      expect(mockCreateMessageUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        dto,
      );
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getMessages', () => {
    it('should get messages for an application', async () => {
      const mockMessages = [
        { id: 1, messageText: 'Hello!' },
        { id: 2, messageText: 'Hi!' },
      ];
      mockGetMessagesUseCase.execute.mockResolvedValue(mockMessages);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const result = await controller.getMessages(req as never, 1);

      expect(mockGetMessagesUseCase.execute).toHaveBeenCalledWith(1, 'user-1');
      expect(result).toEqual(mockMessages);
    });
  });
});
