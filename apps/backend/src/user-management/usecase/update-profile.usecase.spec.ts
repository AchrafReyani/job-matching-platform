import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from './update-profile.usecase';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as userManagementRepository from '../repository/user-management.repository';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  const mockRepo = {
    findJobSeekerByUserId: jest.fn(),
    findCompanyByUserId: jest.fn(),
    updateJobSeekerProfile: jest.fn(),
    updateCompanyProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: userManagementRepository.USER_MANAGEMENT_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Job Seeker', () => {
    it('should update job seeker profile successfully', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue({ id: 1 });
      mockRepo.updateJobSeekerProfile.mockResolvedValue({
        id: 1,
        fullName: 'Updated Name',
      });

      const result = await useCase.execute('user-1', 'JOB_SEEKER', {
        fullName: 'Updated Name',
      });

      expect(mockRepo.findJobSeekerByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepo.updateJobSeekerProfile).toHaveBeenCalledWith('user-1', {
        fullName: 'Updated Name',
      });
      expect(result.message).toBe('Profile updated successfully');
    });

    it('should throw NotFoundException if job seeker not found', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue(null);

      await expect(
        useCase.execute('user-1', 'JOB_SEEKER', { fullName: 'Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Company', () => {
    it('should update company profile successfully', async () => {
      mockRepo.findCompanyByUserId.mockResolvedValue({ id: 1 });
      mockRepo.updateCompanyProfile.mockResolvedValue({
        id: 1,
        companyName: 'Updated Corp',
      });

      const result = await useCase.execute('user-1', 'COMPANY', {
        companyName: 'Updated Corp',
      });

      expect(mockRepo.findCompanyByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepo.updateCompanyProfile).toHaveBeenCalledWith('user-1', {
        companyName: 'Updated Corp',
      });
      expect(result.message).toBe('Company profile updated successfully');
    });

    it('should throw NotFoundException if company not found', async () => {
      mockRepo.findCompanyByUserId.mockResolvedValue(null);

      await expect(
        useCase.execute('user-1', 'COMPANY', { companyName: 'Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('should throw BadRequestException for invalid role', async () => {
    await expect(useCase.execute('user-1', 'INVALID_ROLE', {})).rejects.toThrow(
      BadRequestException,
    );
  });
});
