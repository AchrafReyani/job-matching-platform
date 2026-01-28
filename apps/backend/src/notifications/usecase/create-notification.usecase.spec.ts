import { Test, TestingModule } from "@nestjs/testing";
import { CreateNotificationUseCase } from "./create-notification.usecase";
import { NOTIFICATION_REPOSITORY } from "../repository/notification.repository";
import { NotificationType } from "@prisma/client";

describe("CreateNotificationUseCase", () => {
  let useCase: CreateNotificationUseCase;
  const mockRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNotificationUseCase,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateNotificationUseCase>(CreateNotificationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a notification", async () => {
    const notificationData = {
      userId: "user-1",
      type: NotificationType.APPLICATION_ACCEPTED,
      title: "Application Accepted",
      message: "Your application was accepted!",
      relatedId: 10,
    };

    const createdNotification = {
      id: 1,
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
    };

    mockRepo.create.mockResolvedValue(createdNotification);

    const result = await useCase.execute(notificationData);

    expect(mockRepo.create).toHaveBeenCalledWith(notificationData);
    expect(result).toEqual(createdNotification);
  });

  it("should create a notification without relatedId", async () => {
    const notificationData = {
      userId: "user-1",
      type: NotificationType.NEW_MESSAGE,
      title: "New Message",
      message: "You have a new message",
    };

    const createdNotification = {
      id: 2,
      ...notificationData,
      relatedId: null,
      isRead: false,
      createdAt: new Date(),
    };

    mockRepo.create.mockResolvedValue(createdNotification);

    const result = await useCase.execute(notificationData);

    expect(mockRepo.create).toHaveBeenCalledWith(notificationData);
    expect(result).toEqual(createdNotification);
  });
});
