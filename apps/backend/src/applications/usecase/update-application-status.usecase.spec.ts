import { Test, TestingModule } from '@nestjs/testing';
import { UpdateApplicationStatusUseCase } from './update-application-status.usecase';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';
import { NOTIFICATION_REPOSITORY } from '../../notifications/repository/notification.repository';
import { NotificationType } from '@prisma/client';

describe('UpdateApplicationStatusUseCase', () => {
  let useCase: UpdateApplicationStatusUseCase;
  const mockRepo = {
    findCompanyByUserId: jest.fn(),
    findApplicationWithVacancy: jest.fn(),
    findApplicationWithVacancyAndJobSeeker: jest.fn(),
    updateStatus: jest.fn(),
  };
  const mockNotificationRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateApplicationStatusUseCase,
        {
          provide: applicationRepository.APPLICATION_REPOSITORY,
          useValue: mockRepo,
        },
        {
          provide: NOTIFICATION_REPOSITORY,
          useValue: mockNotificationRepo,
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

  it('should update application status and create notification on accept', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue({
      id: 1,
      vacancy: {
        companyId: 5,
        title: 'Developer',
        company: { companyName: 'TechCorp' },
      },
      jobSeeker: { userId: 'seeker-user', fullName: 'John Doe' },
    });
    mockRepo.updateStatus.mockResolvedValue({
      id: 1,
      status: 'ACCEPTED',
    });

    const result = await useCase.execute('company-user', 1, 'ACCEPTED');

    expect(mockRepo.findCompanyByUserId).toHaveBeenCalledWith('company-user');
    expect(mockRepo.findApplicationWithVacancyAndJobSeeker).toHaveBeenCalledWith(1);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'ACCEPTED');
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'seeker-user',
      type: NotificationType.APPLICATION_ACCEPTED,
      title: 'Application Accepted',
      message: 'Your application to Developer at TechCorp was accepted!',
      relatedId: 1,
    });
    expect(result).toEqual({ id: 1, status: 'ACCEPTED' });
  });

  it('should create rejection notification', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue({
      id: 1,
      vacancy: {
        companyId: 5,
        title: 'Developer',
        company: { companyName: 'TechCorp' },
      },
      jobSeeker: { userId: 'seeker-user', fullName: 'John Doe' },
    });
    mockRepo.updateStatus.mockResolvedValue({
      id: 1,
      status: 'REJECTED',
    });

    await useCase.execute('company-user', 1, 'REJECTED');

    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'seeker-user',
      type: NotificationType.APPLICATION_REJECTED,
      title: 'Application Rejected',
      message: 'Your application to Developer at TechCorp was not selected',
      relatedId: 1,
    });
  });

  it('should throw NotFoundException if company not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 1, 'ACCEPTED')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.findApplicationWithVacancyAndJobSeeker).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if application not found', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 999, 'ACCEPTED')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if company does not own vacancy', async () => {
    mockRepo.findCompanyByUserId.mockResolvedValue({ id: 5 });
    mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue({
      id: 1,
      vacancy: { companyId: 10 },
    });

    await expect(useCase.execute('user-1', 1, 'ACCEPTED')).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });
});
