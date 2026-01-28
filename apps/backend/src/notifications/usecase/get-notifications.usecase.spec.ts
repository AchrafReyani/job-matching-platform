import { Test, TestingModule } from "@nestjs/testing";
import { GetNotificationsUseCase } from "./get-notifications.usecase";
import { NOTIFICATION_REPOSITORY } from "../repository/notification.repository";
import { NotificationType } from "@prisma/client";

describe("GetNotificationsUseCase", () => {
  let useCase: GetNotificationsUseCase;
  const mockRepo = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNotificationsUseCase,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetNotificationsUseCase>(GetNotificationsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return notifications for user", async () => {
    const mockNotifications = [
      {
        id: 1,
        userId: "user-1",
        type: NotificationType.NEW_APPLICATION,
        title: "New Application",
        message: "John applied to your vacancy",
        relatedId: 10,
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: "user-1",
        type: NotificationType.NEW_MESSAGE,
        title: "New Message",
        message: "You have a new message",
        relatedId: 5,
        isRead: true,
        createdAt: new Date(),
      },
    ];

    mockRepo.findByUserId.mockResolvedValue(mockNotifications);

    const result = await useCase.execute("user-1", 20, 0);

    expect(mockRepo.findByUserId).toHaveBeenCalledWith("user-1", 20, 0);
    expect(result).toEqual(mockNotifications);
    expect(result).toHaveLength(2);
  });

  it("should return empty array when user has no notifications", async () => {
    mockRepo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute("user-2", 20, 0);

    expect(mockRepo.findByUserId).toHaveBeenCalledWith("user-2", 20, 0);
    expect(result).toEqual([]);
  });

  it("should pass limit and offset to repository", async () => {
    mockRepo.findByUserId.mockResolvedValue([]);

    await useCase.execute("user-1", 10, 5);

    expect(mockRepo.findByUserId).toHaveBeenCalledWith("user-1", 10, 5);
  });
});
