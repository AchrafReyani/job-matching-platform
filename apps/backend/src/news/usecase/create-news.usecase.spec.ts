import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { CreateNewsUseCase } from "./create-news.usecase";
import { NEWS_REPOSITORY } from "../repository/news.repository";
import { NewsCategory, NewsStatus, NewsAudience, News } from "@prisma/client";
import { CreateNewsDto } from "../dto";

describe("CreateNewsUseCase", () => {
  let useCase: CreateNewsUseCase;
  const mockRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateNewsUseCase>(CreateNewsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockNews: News = {
    id: 1,
    title: "Test News",
    content: "Test content",
    category: NewsCategory.ANNOUNCEMENT,
    status: NewsStatus.DRAFT,
    audience: NewsAudience.ALL,
    isPinned: false,
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create news with draft status by default", async () => {
    const dto: CreateNewsDto = {
      title: "Test News",
      content: "Test content",
      category: NewsCategory.ANNOUNCEMENT,
    };
    mockRepo.create.mockResolvedValue(mockNews);

    const result = await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith({
      title: "Test News",
      content: "Test content",
      category: NewsCategory.ANNOUNCEMENT,
      audience: "ALL",
      status: NewsStatus.DRAFT,
      isPinned: false,
      scheduledAt: undefined,
      publishedAt: undefined,
    });
    expect(result).toEqual(mockNews);
  });

  it("should create published news with publishedAt date", async () => {
    const dto: CreateNewsDto = {
      title: "Published News",
      content: "Content",
      category: NewsCategory.RELEASE,
      status: NewsStatus.PUBLISHED,
    };
    const publishedNews = {
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
    };
    mockRepo.create.mockResolvedValue(publishedNews);

    await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NewsStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      }),
    );
  });

  it("should throw BadRequestException if scheduled without scheduledAt", async () => {
    const dto: CreateNewsDto = {
      title: "Scheduled News",
      content: "Content",
      category: NewsCategory.MAINTENANCE,
      status: NewsStatus.SCHEDULED,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(dto)).rejects.toThrow(
      "Scheduled date is required for scheduled posts",
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException if scheduledAt is in the past", async () => {
    const dto: CreateNewsDto = {
      title: "Scheduled News",
      content: "Content",
      category: NewsCategory.MAINTENANCE,
      status: NewsStatus.SCHEDULED,
      scheduledAt: "2020-01-01T00:00:00Z",
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(dto)).rejects.toThrow(
      "Scheduled date must be in the future",
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("should create scheduled news with valid scheduledAt", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const dto: CreateNewsDto = {
      title: "Scheduled News",
      content: "Content",
      category: NewsCategory.MAINTENANCE,
      status: NewsStatus.SCHEDULED,
      scheduledAt: futureDate.toISOString(),
    };
    mockRepo.create.mockResolvedValue({
      ...mockNews,
      status: NewsStatus.SCHEDULED,
      scheduledAt: futureDate,
    });

    await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NewsStatus.SCHEDULED,
        scheduledAt: expect.any(Date),
      }),
    );
  });

  it("should respect audience and isPinned values", async () => {
    const dto: CreateNewsDto = {
      title: "Job Seeker News",
      content: "Content for job seekers",
      category: NewsCategory.TIPS_AND_TRICKS,
      audience: NewsAudience.JOB_SEEKER,
      isPinned: true,
    };
    mockRepo.create.mockResolvedValue(mockNews);

    await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        audience: NewsAudience.JOB_SEEKER,
        isPinned: true,
      }),
    );
  });
});
