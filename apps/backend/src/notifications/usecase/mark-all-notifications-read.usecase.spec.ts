import { Test, TestingModule } from '@nestjs/testing';
import { MarkAllNotificationsReadUseCase } from './mark-all-notifications-read.usecase';
import { NOTIFICATION_REPOSITORY } from '../repository/notification.repository';

describe('MarkAllNotificationsReadUseCase', () => {
  let useCase: MarkAllNotificationsReadUseCase;
  const mockRepo = {
    markAllAsReadByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkAllNotificationsReadUseCase,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<MarkAllNotificationsReadUseCase>(
      MarkAllNotificationsReadUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mark all notifications as read and return count', async () => {
    mockRepo.markAllAsReadByUserId.mockResolvedValue(5);

    const result = await useCase.execute('user-1');

    expect(mockRepo.markAllAsReadByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ markedCount: 5 });
  });

  it('should return zero when no unread notifications exist', async () => {
    mockRepo.markAllAsReadByUserId.mockResolvedValue(0);

    const result = await useCase.execute('user-2');

    expect(mockRepo.markAllAsReadByUserId).toHaveBeenCalledWith('user-2');
    expect(result).toEqual({ markedCount: 0 });
  });
});
