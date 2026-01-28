import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserUseCase } from "./create-user.usecase";
import { ConflictException } from "@nestjs/common";
import * as userRepository from "../repository/user.repository";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  const mockRepo = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: userRepository.USER_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user successfully", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    mockRepo.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      role: "JOB_SEEKER",
    });

    const result = await useCase.execute(
      "test@example.com",
      "password123",
      "JOB_SEEKER",
    );

    expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockRepo.create).toHaveBeenCalledWith(
      "test@example.com",
      "hashed-password",
      "JOB_SEEKER",
    );
    expect(result.email).toBe("test@example.com");
  });

  it("should throw ConflictException if email already exists", async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: "existing-user" });

    await expect(
      useCase.execute("existing@example.com", "password", "JOB_SEEKER"),
    ).rejects.toThrow(ConflictException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
