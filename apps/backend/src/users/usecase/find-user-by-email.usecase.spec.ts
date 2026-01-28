import { Test, TestingModule } from "@nestjs/testing";
import { FindUserByEmailUseCase } from "./find-user-by-email.usecase";
import { NotFoundException } from "@nestjs/common";
import * as userRepository from "../repository/user.repository";

describe("FindUserByEmailUseCase", () => {
  let useCase: FindUserByEmailUseCase;
  const mockRepo = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByEmailUseCase,
        {
          provide: userRepository.USER_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<FindUserByEmailUseCase>(FindUserByEmailUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user by email", async () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      role: "JOB_SEEKER",
    };
    mockRepo.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute("test@example.com");

    expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(result).toEqual(user);
  });

  it("should throw NotFoundException if user not found", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute("nonexistent@example.com")).rejects.toThrow(
      NotFoundException,
    );
  });
});
