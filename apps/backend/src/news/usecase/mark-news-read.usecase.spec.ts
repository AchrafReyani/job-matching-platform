import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { MarkNewsReadUseCase } from "./mark-news-read.usecase";
import { NEWS_REPOSITORY } from "../repository/news.repository";
import { NewsCategory, NewsStatus, NewsAudience, News } from "@prisma/client";

describe("MarkNewsReadUseCase", () => {
  let useCase: MarkNewsReadUseCase;
  const mockRepo = {
    findById: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkNewsReadUseCase,
        {
          provide: NEWS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<MarkNewsReadUseCase>(MarkNewsReadUseCase);
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

  it("should throw NotFoundException if news does not exist", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, "user-1", "JOB_SEEKER")).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException if news is not published", async () => {
    const draftNews = { ...mockNews, status: NewsStatus.DRAFT };
    mockRepo.findById.mockResolvedValue(draftNews);

    await expect(useCase.execute(1, "user-1", "JOB_SEEKER")).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });

  it("should mark news as read for JOB_SEEKER with ALL audience", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    mockRepo.markAsRead.mockResolvedValue({
      id: 1,
      newsId: 1,
      userId: "user-1",
      readAt: new Date(),
    });

    await useCase.execute(1, "user-1", "JOB_SEEKER");

    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, "user-1");
  });

  it("should mark news as read for COMPANY with ALL audience", async () => {
    mockRepo.findById.mockResolvedValue(mockNews);
    mockRepo.markAsRead.mockResolvedValue({
      id: 1,
      newsId: 1,
      userId: "company-1",
      readAt: new Date(),
    });

    await useCase.execute(1, "company-1", "COMPANY");

    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, "company-1");
  });

  it("should mark job seeker only news as read for job seekers", async () => {
    const jobSeekerNews = { ...mockNews, audience: NewsAudience.JOB_SEEKER };
    mockRepo.findById.mockResolvedValue(jobSeekerNews);
    mockRepo.markAsRead.mockResolvedValue({
      id: 1,
      newsId: 1,
      userId: "user-1",
      readAt: new Date(),
    });

    await useCase.execute(1, "user-1", "JOB_SEEKER");

    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, "user-1");
  });

  it("should throw ForbiddenException for company trying to read job seeker only news", async () => {
    const jobSeekerNews = { ...mockNews, audience: NewsAudience.JOB_SEEKER };
    mockRepo.findById.mockResolvedValue(jobSeekerNews);

    await expect(useCase.execute(1, "company-1", "COMPANY")).rejects.toThrow(
      ForbiddenException,
    );
    await expect(useCase.execute(1, "company-1", "COMPANY")).rejects.toThrow(
      "You do not have access to this news",
    );
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw ForbiddenException for job seeker trying to read company only news", async () => {
    const companyNews = { ...mockNews, audience: NewsAudience.COMPANY };
    mockRepo.findById.mockResolvedValue(companyNews);

    await expect(useCase.execute(1, "user-1", "JOB_SEEKER")).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockRepo.markAsRead).not.toHaveBeenCalled();
  });

  it("should allow company to read company only news", async () => {
    const companyNews = { ...mockNews, audience: NewsAudience.COMPANY };
    mockRepo.findById.mockResolvedValue(companyNews);
    mockRepo.markAsRead.mockResolvedValue({
      id: 1,
      newsId: 1,
      userId: "company-1",
      readAt: new Date(),
    });

    await useCase.execute(1, "company-1", "COMPANY");

    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, "company-1");
  });
});
