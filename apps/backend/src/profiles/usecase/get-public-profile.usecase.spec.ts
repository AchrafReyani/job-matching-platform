import { Test, TestingModule } from "@nestjs/testing";
import { GetPublicProfileUseCase } from "./get-public-profile.usecase";
import { NotFoundException } from "@nestjs/common";
import * as profileRepository from "../repository/profile.repository";

describe("GetPublicProfileUseCase", () => {
  let useCase: GetPublicProfileUseCase;
  const mockRepo = {
    findUserWithProfiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublicProfileUseCase,
        {
          provide: profileRepository.PROFILE_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetPublicProfileUseCase>(GetPublicProfileUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return job seeker public profile", async () => {
    const user = {
      id: "user-1",
      role: "JOB_SEEKER",
      jobSeeker: {
        fullName: "John Doe",
        portfolioUrl: "https://portfolio.com",
        experienceSummary: "Experienced developer",
      },
      company: null,
    };
    mockRepo.findUserWithProfiles.mockResolvedValue(user);

    const result = await useCase.execute("user-1");

    expect(mockRepo.findUserWithProfiles).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      userId: "user-1",
      role: "JOB_SEEKER",
      profile: {
        fullName: "John Doe",
        portfolioUrl: "https://portfolio.com",
        experienceSummary: "Experienced developer",
      },
    });
  });

  it("should return company public profile", async () => {
    const user = {
      id: "company-1",
      role: "COMPANY",
      jobSeeker: null,
      company: {
        companyName: "Acme Corp",
        websiteUrl: "https://acme.com",
        description: "Tech company",
      },
    };
    mockRepo.findUserWithProfiles.mockResolvedValue(user);

    const result = await useCase.execute("company-1");

    expect(result).toEqual({
      userId: "company-1",
      role: "COMPANY",
      profile: {
        companyName: "Acme Corp",
        websiteUrl: "https://acme.com",
        description: "Tech company",
      },
    });
  });

  it("should throw NotFoundException if user not found", async () => {
    mockRepo.findUserWithProfiles.mockResolvedValue(null);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      NotFoundException,
    );
  });
});
