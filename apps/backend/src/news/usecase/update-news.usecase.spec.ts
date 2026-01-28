import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { UpdateNewsUseCase } from "./update-news.usecase";
import { NEWS_REPOSITORY } from "../repository/news.repository";
import { NewsCategory, NewsStatus, NewsAudience, News } from "@prisma/client";
import { UpdateNewsDto } from "../dto";

describe("UpdateNewsUseCase", () => {
  let useCase: UpdateNewsUseCase;
  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateNewsUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateNewsUseCase>(UpdateNewsUseCase);
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

  it("should throw NotFoundException if news does not exist", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, { title: "New Title" })).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("should update title successfully", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    const updatedNews = { ...mockNews, title: "Updated Title" };
    mockRepo.update.mockResolvedValue(updatedNews);

    const dto: UpdateNewsDto = { title: "Updated Title" };
    const result = await useCase.execute(1, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(1, { title: "Updated Title" });
    expect(result).toEqual(updatedNews);
  });

  it("should set publishedAt when changing status to PUBLISHED", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    mockRepo.update.mockResolvedValue({
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const dto: UpdateNewsDto = { status: NewsStatus.PUBLISHED };
    await useCase.execute(1, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        status: NewsStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      }),
    );
  });

  it("should not override existing publishedAt when already published", async () => {
    const publishedDate = new Date("2025-01-01");
    const publishedNews = {
      ...mockNews,
      status: NewsStatus.PUBLISHED,
      publishedAt: publishedDate,
    };
    mockRepo.findById.mockResolvedValue(publishedNews);
    mockRepo.update.mockResolvedValue(publishedNews);

    const dto: UpdateNewsDto = { status: NewsStatus.PUBLISHED };
    await useCase.execute(1, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      status: NewsStatus.PUBLISHED,
    });
  });

  it("should throw BadRequestException when setting SCHEDULED without scheduledAt", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);

    const dto: UpdateNewsDto = { status: NewsStatus.SCHEDULED };
    await expect(useCase.execute(1, dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(1, dto)).rejects.toThrow(
      "Scheduled date is required for scheduled posts",
    );
  });

  it("should allow SCHEDULED status if news already has scheduledAt", async () => {
    const scheduledNews = { ...mockNews, scheduledAt: new Date("2030-01-01") };
    mockRepo.findById.mockResolvedValue(scheduledNews);
    mockRepo.update.mockResolvedValue({
      ...scheduledNews,
      status: NewsStatus.SCHEDULED,
    });

    const dto: UpdateNewsDto = { status: NewsStatus.SCHEDULED };
    await useCase.execute(1, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      status: NewsStatus.SCHEDULED,
    });
  });

  it("should throw BadRequestException if scheduledAt is in the past", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);

    const dto: UpdateNewsDto = { scheduledAt: "2020-01-01T00:00:00Z" };
    await expect(useCase.execute(1, dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(1, dto)).rejects.toThrow(
      "Scheduled date must be in the future",
    );
  });

  it("should update multiple fields at once", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    mockRepo.update.mockResolvedValue(mockNews);

    const dto: UpdateNewsDto = {
      title: "New Title",
      content: "New Content",
      category: NewsCategory.RELEASE,
      isPinned: true,
    };
    await useCase.execute(1, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      title: "New Title",
      content: "New Content",
      category: NewsCategory.RELEASE,
      isPinned: true,
    });
  });
});
