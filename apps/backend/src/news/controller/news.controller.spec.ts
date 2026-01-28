import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { NewsController } from "./news.controller";
import {
  CreateNewsUseCase,
  UpdateNewsUseCase,
  DeleteNewsUseCase,
  GetNewsUseCase,
  GetNewsByIdUseCase,
  GetNewsForUserUseCase,
  MarkNewsReadUseCase,
  GetNewsUnreadCountUseCase,
  PublishNewsUseCase,
} from "../usecase";
import { AuthenticatedRequest } from "../../common/interfaces/authenticated-request.interface";
import { NewsCategory, NewsStatus, NewsAudience } from "@prisma/client";

describe("NewsController", () => {
  let controller: NewsController;
  let _createNewsUseCase: CreateNewsUseCase;
  let _updateNewsUseCase: UpdateNewsUseCase;
  let _deleteNewsUseCase: DeleteNewsUseCase;
  let _getNewsUseCase: GetNewsUseCase;
  let _getNewsByIdUseCase: GetNewsByIdUseCase;
  let _getNewsForUserUseCase: GetNewsForUserUseCase;
  let _markNewsReadUseCase: MarkNewsReadUseCase;
  let _getNewsUnreadCountUseCase: GetNewsUnreadCountUseCase;
  let _publishNewsUseCase: PublishNewsUseCase;

  const mockCreateNewsUseCase = { execute: jest.fn() };
  const mockUpdateNewsUseCase = { execute: jest.fn() };
  const mockDeleteNewsUseCase = { execute: jest.fn() };
  const mockGetNewsUseCase = { execute: jest.fn() };
  const mockGetNewsByIdUseCase = { execute: jest.fn() };
  const mockGetNewsForUserUseCase = { execute: jest.fn() };
  const mockMarkNewsReadUseCase = { execute: jest.fn() };
  const mockGetNewsUnreadCountUseCase = { execute: jest.fn() };
  const mockPublishNewsUseCase = { execute: jest.fn() };

  const mockNews = {
    id: 1,
    title: "Test News",
    content: "Test content",
    category: NewsCategory.ANNOUNCEMENT,
    targetAudience: NewsAudience.ALL,
    status: NewsStatus.PUBLISHED,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: CreateNewsUseCase, useValue: mockCreateNewsUseCase },
        { provide: UpdateNewsUseCase, useValue: mockUpdateNewsUseCase },
        { provide: DeleteNewsUseCase, useValue: mockDeleteNewsUseCase },
        { provide: GetNewsUseCase, useValue: mockGetNewsUseCase },
        { provide: GetNewsByIdUseCase, useValue: mockGetNewsByIdUseCase },
        { provide: GetNewsForUserUseCase, useValue: mockGetNewsForUserUseCase },
        { provide: MarkNewsReadUseCase, useValue: mockMarkNewsReadUseCase },
        {
          provide: GetNewsUnreadCountUseCase,
          useValue: mockGetNewsUnreadCountUseCase,
        },
        { provide: PublishNewsUseCase, useValue: mockPublishNewsUseCase },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    _createNewsUseCase = module.get<CreateNewsUseCase>(CreateNewsUseCase);
    _updateNewsUseCase = module.get<UpdateNewsUseCase>(UpdateNewsUseCase);
    _deleteNewsUseCase = module.get<DeleteNewsUseCase>(DeleteNewsUseCase);
    _getNewsUseCase = module.get<GetNewsUseCase>(GetNewsUseCase);
    _getNewsByIdUseCase = module.get<GetNewsByIdUseCase>(GetNewsByIdUseCase);
    _getNewsForUserUseCase = module.get<GetNewsForUserUseCase>(
      GetNewsForUserUseCase,
    );
    _markNewsReadUseCase = module.get<MarkNewsReadUseCase>(MarkNewsReadUseCase);
    _getNewsUnreadCountUseCase = module.get<GetNewsUnreadCountUseCase>(
      GetNewsUnreadCountUseCase,
    );
    _publishNewsUseCase = module.get<PublishNewsUseCase>(PublishNewsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== Admin Endpoints ==========

  describe("getNewsAdmin", () => {
    it("should return news list for admin", async () => {
      const mockResult = {
        data: [mockNews],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockGetNewsUseCase.execute.mockResolvedValue(mockResult);

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      const query = { page: 1, limit: 10 };
      const result = await controller.getNewsAdmin(req, query);

      expect(mockGetNewsUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;

      await expect(controller.getNewsAdmin(req, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getNewsByIdAdmin", () => {
    it("should return news by id for admin", async () => {
      mockGetNewsByIdUseCase.execute.mockResolvedValue(mockNews);

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      const result = await controller.getNewsByIdAdmin(req, 1);

      expect(mockGetNewsByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNews);
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "COMPANY" },
      } as AuthenticatedRequest;

      await expect(controller.getNewsByIdAdmin(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("createNews", () => {
    it("should create news for admin", async () => {
      const dto = {
        title: "New Announcement",
        content: "Content here",
        category: NewsCategory.ANNOUNCEMENT,
        targetAudience: NewsAudience.ALL,
      };
      mockCreateNewsUseCase.execute.mockResolvedValue({ ...mockNews, ...dto });

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      const result = await controller.createNews(req, dto);

      expect(mockCreateNewsUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.title).toBe(dto.title);
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const dto = {
        title: "Test",
        content: "Test",
        category: NewsCategory.ANNOUNCEMENT,
        targetAudience: NewsAudience.ALL,
      };

      await expect(controller.createNews(req, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("updateNews", () => {
    it("should update news for admin", async () => {
      const dto = { title: "Updated Title" };
      mockUpdateNewsUseCase.execute.mockResolvedValue({
        ...mockNews,
        title: "Updated Title",
      });

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      const result = await controller.updateNews(req, 1, dto);

      expect(mockUpdateNewsUseCase.execute).toHaveBeenCalledWith(1, dto);
      expect(result.title).toBe("Updated Title");
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "COMPANY" },
      } as AuthenticatedRequest;

      await expect(
        controller.updateNews(req, 1, { title: "Test" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("deleteNews", () => {
    it("should delete news for admin", async () => {
      mockDeleteNewsUseCase.execute.mockResolvedValue(undefined);

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      await controller.deleteNews(req, 1);

      expect(mockDeleteNewsUseCase.execute).toHaveBeenCalledWith(1);
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;

      await expect(controller.deleteNews(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("publishNews", () => {
    it("should publish news for admin", async () => {
      mockPublishNewsUseCase.execute.mockResolvedValue({
        ...mockNews,
        status: NewsStatus.PUBLISHED,
      });

      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;
      const result = await controller.publishNews(req, 1);

      expect(mockPublishNewsUseCase.execute).toHaveBeenCalledWith(1);
      expect(result.status).toBe(NewsStatus.PUBLISHED);
    });

    it("should throw ForbiddenException for non-admin", async () => {
      const req = {
        user: { userId: "user-1", role: "COMPANY" },
      } as AuthenticatedRequest;

      await expect(controller.publishNews(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ========== User Endpoints ==========

  describe("getNewsForUser", () => {
    it("should return news for job seeker", async () => {
      const mockResult = {
        data: [mockNews],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockGetNewsForUserUseCase.execute.mockResolvedValue(mockResult);

      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const result = await controller.getNewsForUser(req, 1, 10);

      expect(mockGetNewsForUserUseCase.execute).toHaveBeenCalledWith(
        "user-1",
        "JOB_SEEKER",
        1,
        10,
      );
      expect(result).toEqual(mockResult);
    });

    it("should return news for company", async () => {
      const mockResult = {
        data: [mockNews],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockGetNewsForUserUseCase.execute.mockResolvedValue(mockResult);

      const req = {
        user: { userId: "company-1", role: "COMPANY" },
      } as AuthenticatedRequest;
      const result = await controller.getNewsForUser(req, 1, 10);

      expect(mockGetNewsForUserUseCase.execute).toHaveBeenCalledWith(
        "company-1",
        "COMPANY",
        1,
        10,
      );
      expect(result).toEqual(mockResult);
    });

    it("should throw ForbiddenException for admin", async () => {
      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;

      await expect(controller.getNewsForUser(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count for job seeker", async () => {
      mockGetNewsUnreadCountUseCase.execute.mockResolvedValue({ count: 5 });

      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const result = await controller.getUnreadCount(req);

      expect(mockGetNewsUnreadCountUseCase.execute).toHaveBeenCalledWith(
        "user-1",
        "JOB_SEEKER",
      );
      expect(result).toEqual({ count: 5 });
    });

    it("should throw ForbiddenException for admin", async () => {
      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;

      await expect(controller.getUnreadCount(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getNewsById", () => {
    it("should return news by id for user", async () => {
      mockGetNewsByIdUseCase.execute.mockResolvedValue(mockNews);

      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const result = await controller.getNewsById(req, 1);

      expect(mockGetNewsByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNews);
    });

    it("should throw ForbiddenException for admin", async () => {
      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;

      await expect(controller.getNewsById(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("markAsRead", () => {
    it("should mark news as read for user", async () => {
      mockMarkNewsReadUseCase.execute.mockResolvedValue(undefined);

      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const result = await controller.markAsRead(req, 1);

      expect(mockMarkNewsReadUseCase.execute).toHaveBeenCalledWith(
        1,
        "user-1",
        "JOB_SEEKER",
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw ForbiddenException for admin", async () => {
      const req = {
        user: { userId: "admin-1", role: "ADMIN" },
      } as AuthenticatedRequest;

      await expect(controller.markAsRead(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
