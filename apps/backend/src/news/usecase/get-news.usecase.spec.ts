import { Test, TestingModule } from "@nestjs/testing";
import { GetNewsUseCase } from "./get-news.usecase";
import { NEWS_REPOSITORY, PaginatedNews } from "../repository/news.repository";
import { NewsCategory, NewsStatus, NewsAudience, News } from "@prisma/client";
import { NewsQueryDto } from "../dto";

describe("GetNewsUseCase", () => {
  let useCase: GetNewsUseCase;
  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetNewsUseCase>(GetNewsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockNews: News = {
    id: 1,
    title: "Test News",
    content: "Test content",
    category: NewsCategory.ANNOUNCEMENT,
    status: NewsStatus.PUBLISHED,
    audience: NewsAudience.ALL,
    isPinned: false,
    scheduledAt: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult: PaginatedNews = {
    data: [mockNews],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  it("should return paginated news with default pagination", async () => {
    mockRepo.findAll.mockResolvedValue(mockPaginatedResult);

    const query: NewsQueryDto = {};
    const result = await useCase.execute(query);

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      category: undefined,
      status: undefined,
      audience: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(mockPaginatedResult);
  });

  it("should pass filters to repository", async () => {
    mockRepo.findAll.mockResolvedValue(mockPaginatedResult);

    const query: NewsQueryDto = {
      category: NewsCategory.RELEASE,
      status: NewsStatus.PUBLISHED,
      audience: NewsAudience.JOB_SEEKER,
      page: 2,
      limit: 5,
    };
    await useCase.execute(query);

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      category: NewsCategory.RELEASE,
      status: NewsStatus.PUBLISHED,
      audience: NewsAudience.JOB_SEEKER,
      page: 2,
      limit: 5,
    });
  });

  it("should handle empty results", async () => {
    const emptyResult: PaginatedNews = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    mockRepo.findAll.mockResolvedValue(emptyResult);

    const result = await useCase.execute({});

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
