import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MarkNotificationReadUseCase } from './mark-notification-read.usecase';
import { NOTIFICATION_REPOSITORY } from '../repository/notification.repository';
import { NotificationType } from '@prisma/client';

describe('MarkNotificationReadUseCase', () => {
  let useCase: MarkNotificationReadUseCase;
  const mockRepo = {
    findById: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkNotificationReadUseCase,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<MarkNotificationReadUseCase>(MarkNotificationReadUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mark notification as read', async () => {
    const notification = {
      id: 1,
      userId: 'user-1',
      type: NotificationType.NEW_APPLICATION,
      title: 'Test',
      message: 'Test message',
      relatedId: null,
      isRead: false,
      createdAt: new Date(),
    };

    const updatedNotification = { ...notification, isRead: true };

    mockRepo.findById.mockResolvedValue(notification);
    mockRepo.markAsRead.mockResolvedValue(updatedNotification);

    const result = await useCase.execute('user-1', 1);

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1);
    expect(result.isRead).toBe(true);
  });

  it('should throw NotFoundException when notification does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 999)).rejects.toThrow(NotFoundException);
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when notification belongs to another user', async () => {
    const notification = {
      id: 1,
      userId: 'user-2',
      type: NotificationType.NEW_APPLICATION,
      title: 'Test',
      message: 'Test message',
      relatedId: null,
      isRead: false,
      createdAt: new Date(),
    };

    mockRepo.findById.mockResolvedValue(notification);

    await expect(useCase.execute('user-1', 1)).rejects.toThrow(ForbiddenException);
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });
});
