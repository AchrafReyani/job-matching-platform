import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteNewsUseCase } from './delete-news.usecase';
import { NEWS_REPOSITORY } from '../repository/news.repository';
import { NewsCategory, NewsStatus, NewsAudience, News } from '@prisma/client';

describe('DeleteNewsUseCase', () => {
  let useCase: DeleteNewsUseCase;
  const mockRepo = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<DeleteNewsUseCase>(DeleteNewsUseCase);
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
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('should delete news if it exists', async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should delete published news', async () => {
    const publishedNews = { ...mockNews, status: NewsStatus.PUBLISHED, publishedAt: new Date() };
    mockRepo.findById.mockResolvedValue(publishedNews);
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
