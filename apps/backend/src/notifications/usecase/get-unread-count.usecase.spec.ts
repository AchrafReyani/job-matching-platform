import { Test, TestingModule } from "@nestjs/testing";
import { GetUnreadCountUseCase } from "./get-unread-count.usecase";
import { NOTIFICATION_REPOSITORY } from "../repository/notification.repository";

describe("GetUnreadCountUseCase", () => {
  let useCase: GetUnreadCountUseCase;
  const mockRepo = {
    countUnreadByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUnreadCountUseCase,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetUnreadCountUseCase>(GetUnreadCountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return unread count for user", async () => {
    mockRepo.countUnreadByUserId.mockResolvedValue(5);

    const result = await useCase.execute("user-1");

    expect(mockRepo.countUnreadByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ count: 5 });
  });

  it("should return zero when user has no unread notifications", async () => {
    mockRepo.countUnreadByUserId.mockResolvedValue(0);

    const result = await useCase.execute("user-2");

    expect(mockRepo.countUnreadByUserId).toHaveBeenCalledWith("user-2");
    expect(result).toEqual({ count: 0 });
  });
});
