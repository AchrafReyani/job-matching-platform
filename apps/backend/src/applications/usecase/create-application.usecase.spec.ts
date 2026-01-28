import { Test, TestingModule } from "@nestjs/testing";
import { CreateApplicationUseCase } from "./create-application.usecase";
import { NotFoundException, ConflictException } from "@nestjs/common";
import * as applicationRepository from "../repository/application.repository";

describe("CreateApplicationUseCase", () => {
  let useCase: CreateApplicationUseCase;
  const mockRepo = {
    create: jest.fn(),
    findVacancyWithCompanyById: jest.fn(),
    findJobSeekerByUserId: jest.fn(),
    findExisting: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateApplicationUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateApplicationUseCase>(CreateApplicationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an application successfully", async () => {
    mockRepo.findVacancyWithCompanyById.mockResolvedValue({
      id: 1,
      title: "Developer",
    });
    mockRepo.findJobSeekerByUserId.mockResolvedValue({
      id: 10,
      userId: "user-1",
    });
    mockRepo.findExisting.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({
      id: 100,
      jobSeekerId: 10,
      vacancyId: 1,
      status: "APPLIED",
    });

    const result = await useCase.execute("user-1", 1);

    expect(mockRepo.findVacancyWithCompanyById).toHaveBeenCalledWith(1);
    expect(mockRepo.findJobSeekerByUserId).toHaveBeenCalledWith("user-1");
    expect(mockRepo.findExisting).toHaveBeenCalledWith(10, 1);
    expect(mockRepo.create).toHaveBeenCalledWith(10, 1);
    expect(result).toEqual({
      id: 100,
      jobSeekerId: 10,
      vacancyId: 1,
      status: "APPLIED",
    });
  });

  it("should throw NotFoundException if vacancy not found", async () => {
    mockRepo.findVacancyWithCompanyById.mockResolvedValue(null);

    await expect(useCase.execute("user-1", 999)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.findJobSeekerByUserId).not.toHaveBeenCalled();
  });

  it("should throw NotFoundException if job seeker profile not found", async () => {
    mockRepo.findVacancyWithCompanyById.mockResolvedValue({ id: 1 });
    mockRepo.findJobSeekerByUserId.mockResolvedValue(null);

    await expect(useCase.execute("user-1", 1)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.findExisting).not.toHaveBeenCalled();
  });

  it("should throw ConflictException if already applied", async () => {
    mockRepo.findVacancyWithCompanyById.mockResolvedValue({ id: 1 });
    mockRepo.findJobSeekerByUserId.mockResolvedValue({ id: 10 });
    mockRepo.findExisting.mockResolvedValue({ id: 100 });

    await expect(useCase.execute("user-1", 1)).rejects.toThrow(
      ConflictException,
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
