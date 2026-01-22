import { Test, TestingModule } from '@nestjs/testing';
import { UpdateApplicationStatusUseCase } from './update-application-status.usecase';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';

describe('UpdateApplicationStatusUseCase', () => {
  let useCase: UpdateApplicationStatusUseCase;
  const mockRepo = {
    findCompanyByUserId: jest.fn(),
    findApplicationWithVacancy: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateApplicationStatusUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateApplicationStatusUseCase>(
      UpdateApplicationStatusUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update application status successfully', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancy.mockResolvedValue({
      id: 1,
      vacancy: { companyId: 5 },
    });
    mockRepo.updateStatus.mockResolvedValue({
      id: 1,
      status: 'ACCEPTED',
    });

    const result = await useCase.execute('company-user', 1, 'ACCEPTED');

    expect(mockRepo.findCompanyByUserId).toHaveBeenCalledWith('company-user');
    expect(mockRepo.findApplicationWithVacancy).toHaveBeenCalledWith(1);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'ACCEPTED');
    expect(result).toEqual({ id: 1, status: 'ACCEPTED' });
  });

  it('should throw NotFoundException if company not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 1, 'ACCEPTED')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.findApplicationWithVacancy).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if application not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancy.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 999, 'ACCEPTED')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if company does not own vacancy', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancy.mockResolvedValue({
      id: 1,
      vacancy: { companyId: 10 },
    });

    await expect(useCase.execute('user-1', 1, 'ACCEPTED')).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });
});
