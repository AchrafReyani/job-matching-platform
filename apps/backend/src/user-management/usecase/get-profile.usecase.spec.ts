import { Test, TestingModule } from "@nestjs/testing";
import { GetProfileUseCase } from "./get-profile.usecase";
import * as userManagementRepository from "../repository/user-management.repository";

describe("GetProfileUseCase", () => {
  let useCase: GetProfileUseCase;
  const mockRepo = {
    findUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        {
          provide: userManagementRepository.USER_MANAGEMENT_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user profile without password hash", async () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      role: "JOB_SEEKER",
      passwordHash: "secret-hash",
      createdAt: new Date(),
      jobSeeker: { id: 1, fullName: "John Doe" },
      company: null,
    };
    mockRepo.findUserById.mockResolvedValue(user);

    const result = await useCase.execute("user-1");

    expect(mockRepo.findUserById).toHaveBeenCalledWith("user-1");
    expect(result).not.toHaveProperty("passwordHash");
    expect(result?.email).toBe("test@example.com");
    expect(result?.jobSeeker?.fullName).toBe("John Doe");
  });

  it("should return null if user not found", async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    const result = await useCase.execute("nonexistent-user");

    expect(result).toBeNull();
  });
});
