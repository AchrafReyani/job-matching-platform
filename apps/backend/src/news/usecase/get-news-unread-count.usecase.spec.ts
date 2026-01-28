import { Test, TestingModule } from '@nestjs/testing';
import { GetNewsUnreadCountUseCase } from './get-news-unread-count.usecase';
import { NEWS_REPOSITORY } from '../repository/news.repository';

describe('GetNewsUnreadCountUseCase', () => {
  let useCase: GetNewsUnreadCountUseCase;
  const mockRepo = {
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNewsUnreadCountUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetNewsUnreadCountUseCase>(GetNewsUnreadCountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return unread count for job seeker', async () => {
    mockRepo.getUnreadCount.mockResolvedValue(5);

    const result = await useCase.execute('user-1', 'JOB_SEEKER');

    expect(mockRepo.getUnreadCount).toHaveBeenCalledWith('user-1', 'JOB_SEEKER');
    expect(result).toEqual({ count: 5 });
  });

  it('should return unread count for company', async () => {
    mockRepo.getUnreadCount.mockResolvedValue(3);

    const result = await useCase.execute('company-1', 'COMPANY');

    expect(mockRepo.getUnreadCount).toHaveBeenCalledWith('company-1', 'COMPANY');
    expect(result).toEqual({ count: 3 });
  });

  it('should return zero count when no unread news', async () => {
    mockRepo.getUnreadCount.mockResolvedValue(0);

    const result = await useCase.execute('user-1', 'JOB_SEEKER');

    expect(result).toEqual({ count: 0 });
  });
});
