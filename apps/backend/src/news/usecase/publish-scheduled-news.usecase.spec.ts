import { Test, TestingModule } from '@nestjs/testing';
import { PublishScheduledNewsUseCase } from './publish-scheduled-news.usecase';
import { NEWS_REPOSITORY } from '../repository/news.repository';
import { NewsCategory, NewsStatus, NewsAudience, News } from '@prisma/client';

describe('PublishScheduledNewsUseCase', () => {
  let useCase: PublishScheduledNewsUseCase;
  const mockRepo = {
    findScheduledToPublish: jest.fn(),
    publishScheduled: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishScheduledNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<PublishScheduledNewsUseCase>(
      PublishScheduledNewsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockNews = (id: number): News => ({
    id,
    title: `Scheduled News ${id}`,
    content: 'Content',
    category: NewsCategory.ANNOUNCEMENT,
    status: NewsStatus.SCHEDULED,
    audience: NewsAudience.ALL,
    isPinned: false,
    scheduledAt: new Date('2025-01-01'),
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('should return 0 when no scheduled news to publish', async () => {
    mockRepo.findScheduledToPublish.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toBe(0);
    expect(mockRepo.publishScheduled).not.toHaveBeenCalled();
  });

  it('should publish single scheduled news', async () => {
    const scheduledNews = [createMockNews(1)];
    mockRepo.findScheduledToPublish.mockResolvedValue(scheduledNews);
    mockRepo.publishScheduled.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(mockRepo.publishScheduled).toHaveBeenCalledWith([1]);
    expect(result).toBe(1);
  });

  it('should publish multiple scheduled news', async () => {
    const scheduledNews = [
      createMockNews(1),
      createMockNews(2),
      createMockNews(3),
    ];
    mockRepo.findScheduledToPublish.mockResolvedValue(scheduledNews);
    mockRepo.publishScheduled.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(mockRepo.publishScheduled).toHaveBeenCalledWith([1, 2, 3]);
    expect(result).toBe(3);
  });
});
