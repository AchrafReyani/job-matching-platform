import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCompanyStatsUseCase } from './get-company-stats.usecase';
import { DASHBOARD_REPOSITORY } from '../repository/dashboard.repository';

describe('GetCompanyStatsUseCase', () => {
  let useCase: GetCompanyStatsUseCase;
  const mockRepo = {
    findCompanyByUserId: jest.fn(),
    getCompanyStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCompanyStatsUseCase,
        { provide: DASHBOARD_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetCompanyStatsUseCase>(GetCompanyStatsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return stats for company', async () => {
    const mockStats = {
      activeVacancies: 5,
      totalApplicants: 25,
      pendingReview: 10,
      accepted: 8,
      rejected: 7,
      newThisWeek: 3,
    };

    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 1 });
    mockRepo.getCompanyStats.mockResolvedValue(mockStats);

    const result = await useCase.execute('user-1');

    expect(mockRepo.findCompanyByUserId).toHaveBeenCalledWith('user-1');
    expect(mockRepo.getCompanyStats).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockStats);
  });

  it('should throw NotFoundException if company profile not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).rejects.toThrow(NotFoundException);
    expect(mockRepo.getCompanyStats).not.toHaveBeenCalled();
  });
});
