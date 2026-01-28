import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { GetJobSeekerStatsUseCase } from "../usecase/get-job-seeker-stats.usecase";
import { GetCompanyStatsUseCase } from "../usecase/get-company-stats.usecase";
import { AuthenticatedRequest } from "../../common/interfaces/authenticated-request.interface";

describe("DashboardController", () => {
  let controller: DashboardController;
  let _getJobSeekerStatsUseCase: GetJobSeekerStatsUseCase;
  let _getCompanyStatsUseCase: GetCompanyStatsUseCase;

  const mockGetJobSeekerStatsUseCase = {
    execute: jest.fn(),
  };
  const mockGetCompanyStatsUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: GetJobSeekerStatsUseCase,
          useValue: mockGetJobSeekerStatsUseCase,
        },
        {
          provide: GetCompanyStatsUseCase,
          useValue: mockGetCompanyStatsUseCase,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    _getJobSeekerStatsUseCase = module.get<GetJobSeekerStatsUseCase>(
      GetJobSeekerStatsUseCase,
    );
    _getCompanyStatsUseCase = module.get<GetCompanyStatsUseCase>(
      GetCompanyStatsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return job seeker stats for JOB_SEEKER role", async () => {
      const mockStats = {
        pending: 5,
        accepted: 2,
        rejected: 1,
        totalSent: 8,
      };

      mockGetJobSeekerStatsUseCase.execute.mockResolvedValue(mockStats);

      const req = {
        user: { userId: "user-1", role: "JOB_SEEKER" },
      } as AuthenticatedRequest;
      const result = await controller.getStats(req);

      expect(mockGetJobSeekerStatsUseCase.execute).toHaveBeenCalledWith(
        "user-1",
      );
      expect(result).toEqual(mockStats);
    });

    it("should return company stats for COMPANY role", async () => {
      const mockStats = {
        activeVacancies: 5,
        totalApplicants: 25,
        pendingReview: 10,
        accepted: 8,
        rejected: 7,
        newThisWeek: 3,
      };

      mockGetCompanyStatsUseCase.execute.mockResolvedValue(mockStats);

      const req = {
        user: { userId: "user-1", role: "COMPANY" },
      } as AuthenticatedRequest;
      const result = await controller.getStats(req);

      expect(mockGetCompanyStatsUseCase.execute).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockStats);
    });

    it("should throw ForbiddenException for invalid role", async () => {
      const req = {
        user: { userId: "user-1", role: "ADMIN" },
      } as AuthenticatedRequest;

      await expect(controller.getStats(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
