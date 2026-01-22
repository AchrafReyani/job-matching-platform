import { Test, TestingModule } from '@nestjs/testing';
import { GetApplicationByIdUseCase } from './get-application-by-id.usecase';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';

describe('GetApplicationByIdUseCase', () => {
  let useCase: GetApplicationByIdUseCase;
  const mockRepo = {
    findByIdWithRelations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetApplicationByIdUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetApplicationByIdUseCase>(GetApplicationByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return application for job seeker', async () => {
    const application = {
      id: 1,
      jobSeeker: { userId: 'user-1', fullName: 'John Doe' },
      vacancy: { company: { userId: 'company-1' } },
    };
    mockRepo.findByIdWithRelations.mockResolvedValue(application);

    const result = await useCase.execute(1, 'user-1');

    expect(mockRepo.findByIdWithRelations).toHaveBeenCalledWith(1);
    expect(result).toEqual(application);
  });

  it('should return application for company owner', async () => {
    const application = {
      id: 1,
      jobSeeker: { userId: 'user-1' },
      vacancy: { company: { userId: 'company-1' } },
    };
    mockRepo.findByIdWithRelations.mockResolvedValue(application);

    const result = await useCase.execute(1, 'company-1');

    expect(result).toEqual(application);
  });

  it('should throw NotFoundException for invalid ID', async () => {
    await expect(useCase.execute(NaN, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if application not found', async () => {
    mockRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(useCase.execute(999, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if user not authorized', async () => {
    const application = {
      id: 1,
      jobSeeker: { userId: 'user-1' },
      vacancy: { company: { userId: 'company-1' } },
    };
    mockRepo.findByIdWithRelations.mockResolvedValue(application);

    await expect(useCase.execute(1, 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
