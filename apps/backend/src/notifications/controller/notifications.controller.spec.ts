import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { GetNotificationsUseCase } from '../usecase/get-notifications.usecase';
import { GetUnreadCountUseCase } from '../usecase/get-unread-count.usecase';
import { MarkNotificationReadUseCase } from '../usecase/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from '../usecase/mark-all-notifications-read.usecase';
import { NotificationType } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let getNotificationsUseCase: GetNotificationsUseCase;
  let getUnreadCountUseCase: GetUnreadCountUseCase;
  let markNotificationReadUseCase: MarkNotificationReadUseCase;
  let markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase;

  const mockGetNotificationsUseCase = {
    execute: jest.fn(),
  };
  const mockGetUnreadCountUseCase = {
    execute: jest.fn(),
  };
  const mockMarkNotificationReadUseCase = {
    execute: jest.fn(),
  };
  const mockMarkAllNotificationsReadUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: GetNotificationsUseCase, useValue: mockGetNotificationsUseCase },
        { provide: GetUnreadCountUseCase, useValue: mockGetUnreadCountUseCase },
        { provide: MarkNotificationReadUseCase, useValue: mockMarkNotificationReadUseCase },
        { provide: MarkAllNotificationsReadUseCase, useValue: mockMarkAllNotificationsReadUseCase },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    getNotificationsUseCase = module.get<GetNotificationsUseCase>(GetNotificationsUseCase);
    getUnreadCountUseCase = module.get<GetUnreadCountUseCase>(GetUnreadCountUseCase);
    markNotificationReadUseCase = module.get<MarkNotificationReadUseCase>(MarkNotificationReadUseCase);
    markAllNotificationsReadUseCase = module.get<MarkAllNotificationsReadUseCase>(MarkAllNotificationsReadUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return notifications for the authenticated user', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 'user-1',
          type: NotificationType.NEW_APPLICATION,
          title: 'New Application',
          message: 'Test message',
          relatedId: null,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      mockGetNotificationsUseCase.execute.mockResolvedValue(mockNotifications);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } } as AuthenticatedRequest;
      const result = await controller.getNotifications(req, { limit: 20, offset: 0 });

      expect(mockGetNotificationsUseCase.execute).toHaveBeenCalledWith('user-1', 20, 0);
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for the authenticated user', async () => {
      mockGetUnreadCountUseCase.execute.mockResolvedValue({ count: 5 });

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } } as AuthenticatedRequest;
      const result = await controller.getUnreadCount(req);

      expect(mockGetUnreadCountUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 1,
        userId: 'user-1',
        type: NotificationType.NEW_APPLICATION,
        title: 'Test',
        message: 'Test message',
        relatedId: null,
        isRead: true,
        createdAt: new Date(),
      };

      mockMarkNotificationReadUseCase.execute.mockResolvedValue(mockNotification);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } } as AuthenticatedRequest;
      const result = await controller.markAsRead(req, 1);

      expect(mockMarkNotificationReadUseCase.execute).toHaveBeenCalledWith('user-1', 1);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockMarkAllNotificationsReadUseCase.execute.mockResolvedValue({ markedCount: 3 });

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } } as AuthenticatedRequest;
      const result = await controller.markAllAsRead(req);

      expect(mockMarkAllNotificationsReadUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ markedCount: 3 });
    });
  });
});
