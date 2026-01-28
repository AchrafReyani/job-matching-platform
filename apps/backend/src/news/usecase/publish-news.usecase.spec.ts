import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PublishNewsUseCase } from './publish-news.usecase';
import { NEWS_REPOSITORY } from '../repository/news.repository';
import { NewsCategory, NewsStatus, NewsAudience, News } from '@prisma/client';

describe('PublishNewsUseCase', () => {
  let useCase: PublishNewsUseCase;
  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<PublishNewsUseCase>(PublishNewsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockNews: News = {
    id: 1,
    title: 'Test News',
    content: 'Test content',
    category: NewsCategory.ANNOUNCEMENT,
    status: NewsStatus.DRAFT,
    audience: NewsAudience.ALL,
    isPinned: false,
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should throw NotFoundException if news does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow('News not found');
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if news is already published', async () => {
    const publishedNews = {
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
    };
    mockRepo.findById.mockResolvedValue(publishedNews);

    await expect(useCase.execute(1)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(1)).rejects.toThrow(
      'News is already published',
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should publish draft news', async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    const publishedNews = {
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
    };
    mockRepo.update.mockResolvedValue(publishedNews);

    const result = await useCase.execute(1);

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      status: NewsStatus.PUBLISHED,
      publishedAt: expect.any(Date),
      scheduledAt: null,
    });
    expect(result.status).toBe(NewsStatus.PUBLISHED);
  });

  it('should publish scheduled news and clear scheduledAt', async () => {
    const scheduledNews = {
      ...mockNews,
      status: NewsStatus.SCHEDULED,
      scheduledAt: new Date('2030-01-01'),
    };
    mockRepo.findById.mockResolvedValue(scheduledNews);
    const publishedNews = {
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      scheduledAt: null,
    };
    mockRepo.update.mockResolvedValue(publishedNews);

    const result = await useCase.execute(1);

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      status: NewsStatus.PUBLISHED,
      publishedAt: expect.any(Date),
      scheduledAt: null,
    });
    expect(result.scheduledAt).toBeNull();
  });
});
