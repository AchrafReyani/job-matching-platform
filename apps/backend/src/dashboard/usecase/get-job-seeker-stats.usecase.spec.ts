import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetJobSeekerStatsUseCase } from './get-job-seeker-stats.usecase';
import { DASHBOARD_REPOSITORY } from '../repository/dashboard.repository';

describe('GetJobSeekerStatsUseCase', () => {
  let useCase: GetJobSeekerStatsUseCase;
  const mockRepo = {
    findJobSeekerByUserId: jest.fn(),
    getJobSeekerStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetJobSeekerStatsUseCase,
        { provide: DASHBOARD_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetJobSeekerStatsUseCase>(GetJobSeekerStatsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return stats for job seeker', async () => {
    const mockStats = {
      pending: 5,
      accepted: 2,
      rejected: 1,
      totalSent: 8,
    };

    mockRepo.findJobSeekerByUserId.mockResolvedValue({ id: 1 });
    mockRepo.getJobSeekerStats.mockResolvedValue(mockStats);

    const result = await useCase.execute('user-1');

    expect(mockRepo.findJobSeekerByUserId).toHaveBeenCalledWith('user-1');
    expect(mockRepo.getJobSeekerStats).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockStats);
  });

  it('should throw NotFoundException if job seeker profile not found', async () => {
    mockRepo.findJobSeekerByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).rejects.toThrow(NotFoundException);
    expect(mockRepo.getJobSeekerStats).not.toHaveBeenCalled();
  });
});
