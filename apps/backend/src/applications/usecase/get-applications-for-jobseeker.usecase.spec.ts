import { Test, TestingModule } from "@nestjs/testing";
import { GetApplicationsForJobSeekerUseCase } from "./get-applications-for-jobseeker.usecase";
import { NotFoundException } from "@nestjs/common";
import * as applicationRepository from "../repository/application.repository";

describe("GetApplicationsForJobSeekerUseCase", () => {
  let useCase: GetApplicationsForJobSeekerUseCase;
  const mockRepo = {
    findJobSeekerByUserId: jest.fn(),
    findByJobSeekerId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetApplicationsForJobSeekerUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetApplicationsForJobSeekerUseCase>(
      GetApplicationsForJobSeekerUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return applications for job seeker", async () => {
    const applications = [
      { id: 1, status: "APPLIED" },
      { id: 2, status: "ACCEPTED" },
    ];
    mockRepo.findJobSeekerByUserId.mockResolvedValue({ id: 10 });
    mockRepo.findByJobSeekerId.mockResolvedValue(applications);

    const result = await useCase.execute("user-1");

    expect(mockRepo.findJobSeekerByUserId).toHaveBeenCalledWith("user-1");
    expect(mockRepo.findByJobSeekerId).toHaveBeenCalledWith(10);
    expect(result).toEqual(applications);
  });

  it("should throw NotFoundException if job seeker not found", async () => {
    mockRepo.findJobSeekerByUserId.mockResolvedValue(null);

    await expect(useCase.execute("user-1")).rejects.toThrow(NotFoundException);
    expect(mockRepo.findByJobSeekerId).not.toHaveBeenCalled();
  });
});
