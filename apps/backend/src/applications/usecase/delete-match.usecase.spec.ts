import { Test, TestingModule } from '@nestjs/testing';
import { DeleteMatchUseCase } from './delete-match.usecase';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as applicationRepository from '../repository/application.repository';
import { NOTIFICATION_REPOSITORY } from '../../notifications/repository/notification.repository';
import { NotificationType } from '@prisma/client';

describe('DeleteMatchUseCase', () => {
  let useCase: DeleteMatchUseCase;
  const mockRepo = {
    findJobSeekerByUserId: jest.fn(),
    findCompanyByUserId: jest.fn(),
    findApplicationWithVacancyAndJobSeeker: jest.fn(),
    getMessagesForApplication: jest.fn(),
    archiveMatch: jest.fn(),
    deleteApplication: jest.fn(),
  };
  const mockNotificationRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMatchUseCase,
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

    useCase = module.get<DeleteMatchUseCase>(DeleteMatchUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockApplication = {
    id: 1,
    vacancyId: 10,
    jobSeekerId: 100,
    status: 'ACCEPTED',
    appliedAt: new Date('2024-01-15'),
    vacancy: {
      id: 10,
      companyId: 5,
      title: 'Software Developer',
      company: { id: 5, userId: 'company-user-id', companyName: 'TechCorp' },
    },
    jobSeeker: { id: 100, userId: 'seeker-user-id', fullName: 'John Doe' },
  };

  const mockMessages = [
    {
      id: 1,
      senderId: 'seeker-user-id',
      messageText: 'Hello',
      sentAt: new Date(),
    },
    {
      id: 2,
      senderId: 'company-user-id',
      messageText: 'Hi there',
      sentAt: new Date(),
    },
  ];

  describe('Job Seeker deletes match', () => {
    it('should delete match successfully when job seeker owns the application', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue({
        id: 100,
        userId: 'seeker-user-id',
      });
      mockRepo.findCompanyByUserId.mockResolvedValue(null);
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        mockApplication,
      );
      mockRepo.getMessagesForApplication.mockResolvedValue(mockMessages);
      mockRepo.archiveMatch.mockResolvedValue({ id: 1 });
      mockRepo.deleteApplication.mockResolvedValue(undefined);

      await useCase.execute('seeker-user-id', 1);

      expect(mockRepo.archiveMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationId: 1,
          vacancyId: 10,
          vacancyTitle: 'Software Developer',
          jobSeekerId: 100,
          jobSeekerName: 'John Doe',
          companyId: 5,
          companyName: 'TechCorp',
          applicationStatus: 'ACCEPTED',
          messageCount: 2,
          deletedBy: 'seeker-user-id',
          deletedByRole: 'JOB_SEEKER',
        }),
      );
      expect(mockRepo.deleteApplication).toHaveBeenCalledWith(1);
      expect(mockNotificationRepo.create).toHaveBeenCalledWith({
        userId: 'company-user-id',
        type: NotificationType.MATCH_ENDED,
        title: 'Match Ended',
        message: 'John Doe has ended the conversation about Software Developer',
        relatedId: 1,
      });
    });
  });

  describe('Company deletes match', () => {
    it('should delete match successfully when company owns the vacancy', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue(null);
      mockRepo.findCompanyByUserId.mockResolvedValue({
        id: 5,
        userId: 'company-user-id',
      });
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        mockApplication,
      );
      mockRepo.getMessagesForApplication.mockResolvedValue(mockMessages);
      mockRepo.archiveMatch.mockResolvedValue({ id: 1 });
      mockRepo.deleteApplication.mockResolvedValue(undefined);

      await useCase.execute('company-user-id', 1);

      expect(mockRepo.archiveMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedBy: 'company-user-id',
          deletedByRole: 'COMPANY',
        }),
      );
      expect(mockRepo.deleteApplication).toHaveBeenCalledWith(1);
      expect(mockNotificationRepo.create).toHaveBeenCalledWith({
        userId: 'seeker-user-id',
        type: NotificationType.MATCH_ENDED,
        title: 'Match Ended',
        message: 'TechCorp has ended the conversation about Software Developer',
        relatedId: 1,
      });
    });
  });

  describe('Authorization errors', () => {
    it('should throw ForbiddenException if user is neither job seeker nor company owner', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue({
        id: 999,
        userId: 'other-seeker',
      });
      mockRepo.findCompanyByUserId.mockResolvedValue(null);
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        mockApplication,
      );

      await expect(useCase.execute('other-seeker', 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.deleteApplication).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if company does not own the vacancy', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue(null);
      mockRepo.findCompanyByUserId.mockResolvedValue({
        id: 999,
        userId: 'other-company',
      });
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        mockApplication,
      );

      await expect(useCase.execute('other-company', 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.deleteApplication).not.toHaveBeenCalled();
    });
  });

  describe('Validation errors', () => {
    it('should throw NotFoundException if application not found', async () => {
      mockRepo.findJobSeekerByUserId.mockResolvedValue({
        id: 100,
        userId: 'seeker-user-id',
      });
      mockRepo.findCompanyByUserId.mockResolvedValue(null);
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(null);

      await expect(useCase.execute('seeker-user-id', 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if application is not ACCEPTED', async () => {
      const pendingApplication = { ...mockApplication, status: 'APPLIED' };
      mockRepo.findJobSeekerByUserId.mockResolvedValue({
        id: 100,
        userId: 'seeker-user-id',
      });
      mockRepo.findCompanyByUserId.mockResolvedValue(null);
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        pendingApplication,
      );

      await expect(useCase.execute('seeker-user-id', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if application is REJECTED', async () => {
      const rejectedApplication = { ...mockApplication, status: 'REJECTED' };
      mockRepo.findJobSeekerByUserId.mockResolvedValue({
        id: 100,
        userId: 'seeker-user-id',
      });
      mockRepo.findCompanyByUserId.mockResolvedValue(null);
      mockRepo.findApplicationWithVacancyAndJobSeeker.mockResolvedValue(
        rejectedApplication,
      );

      await expect(useCase.execute('seeker-user-id', 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
