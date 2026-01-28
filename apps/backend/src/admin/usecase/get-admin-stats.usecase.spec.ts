import { Test, TestingModule } from '@nestjs/testing';
import { GetAdminStatsUseCase } from './get-admin-stats.usecase';
import { ADMIN_REPOSITORY } from '../repository/admin.repository';

describe('GetAdminStatsUseCase', () => {
  let useCase: GetAdminStatsUseCase;
  const mockRepo = {
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminStatsUseCase,
        {
          provide: ADMIN_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetAdminStatsUseCase>(GetAdminStatsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return admin stats', async () => {
    const mockStats = {
      totalJobSeekers: 100,
      totalCompanies: 50,
      totalVacancies: 200,
      totalApplications: 500,
      activeVacancies: 180,
      pendingApplications: 120,
      newUsersThisWeek: 15,
      applicationsThisMonth: 80,
    };

    mockRepo.getStats.mockResolvedValue(mockStats);

    const result = await useCase.execute();

    expect(mockRepo.getStats).toHaveBeenCalled();
    expect(result).toEqual(mockStats);
    expect(result.totalJobSeekers).toBe(100);
    expect(result.totalCompanies).toBe(50);
  });
});
