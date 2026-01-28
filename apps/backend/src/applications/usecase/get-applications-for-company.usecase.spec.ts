import { Test, TestingModule } from '@nestjs/testing';
import { GetApplicationsForCompanyUseCase } from './get-applications-for-company.usecase';
import { NotFoundException } from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';

describe('GetApplicationsForCompanyUseCase', () => {
  let useCase: GetApplicationsForCompanyUseCase;
  const mockRepo = {
    findCompanyByUserId: jest.fn(),
    findByCompanyId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetApplicationsForCompanyUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetApplicationsForCompanyUseCase>(
      GetApplicationsForCompanyUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return applications for company', async () => {
    const applications = [
      { id: 1, status: 'APPLIED' },
      { id: 2, status: 'REJECTED' },
    ];
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findByCompanyId.mockResolvedValue(applications);

    const result = await useCase.execute('company-user-1');

    expect(mockRepo.findCompanyByUserId).toHaveBeenCalledWith('company-user-1');
    expect(mockRepo.findByCompanyId).toHaveBeenCalledWith(5);
    expect(result).toEqual(applications);
  });

  it('should throw NotFoundException if company not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).rejects.toThrow(NotFoundException);
    expect(mockRepo.findByCompanyId).not.toHaveBeenCalled();
  });
});
