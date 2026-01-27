import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { CreateApplicationUseCase } from '../usecase/create-application.usecase';
import { GetApplicationsForJobSeekerUseCase } from '../usecase/get-applications-for-jobseeker.usecase';
import { GetApplicationsForCompanyUseCase } from '../usecase/get-applications-for-company.usecase';
import { GetApplicationByIdUseCase } from '../usecase/get-application-by-id.usecase';
import { UpdateApplicationStatusUseCase } from '../usecase/update-application-status.usecase';
import { DeleteMatchUseCase } from '../usecase/delete-match.usecase';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  const mockCreateApplicationUseCase = { execute: jest.fn() };
  const mockGetApplicationsForJobSeekerUseCase = { execute: jest.fn() };
  const mockGetApplicationsForCompanyUseCase = { execute: jest.fn() };
  const mockGetApplicationByIdUseCase = { execute: jest.fn() };
  const mockUpdateApplicationStatusUseCase = { execute: jest.fn() };
  const mockDeleteMatchUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: CreateApplicationUseCase,
          useValue: mockCreateApplicationUseCase,
        },
        {
          provide: GetApplicationsForJobSeekerUseCase,
          useValue: mockGetApplicationsForJobSeekerUseCase,
        },
        {
          provide: GetApplicationsForCompanyUseCase,
          useValue: mockGetApplicationsForCompanyUseCase,
        },
        {
          provide: GetApplicationByIdUseCase,
          useValue: mockGetApplicationByIdUseCase,
        },
        {
          provide: UpdateApplicationStatusUseCase,
          useValue: mockUpdateApplicationStatusUseCase,
        },
        {
          provide: DeleteMatchUseCase,
          useValue: mockDeleteMatchUseCase,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getApplicationById', () => {
    it('should get application by id', async () => {
      const mockApplication = { id: 1, status: 'APPLIED' };
      mockGetApplicationByIdUseCase.execute.mockResolvedValue(mockApplication);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const result = await controller.getApplicationById(1, req as never);

      expect(mockGetApplicationByIdUseCase.execute).toHaveBeenCalledWith(
        1,
        'user-1',
      );
      expect(result).toEqual(mockApplication);
    });
  });

  describe('apply', () => {
    it('should create application for job seeker', async () => {
      const mockApplication = { id: 1, status: 'APPLIED' };
      mockCreateApplicationUseCase.execute.mockResolvedValue(mockApplication);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const dto = { vacancyId: 5 };
      const result = await controller.apply(req as never, dto);

      expect(mockCreateApplicationUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        5,
      );
      expect(result).toEqual(mockApplication);
    });

    it('should throw ForbiddenException for non job seeker', async () => {
      const req = { user: { userId: 'user-1', role: 'COMPANY' } };
      const dto = { vacancyId: 5 };

      await expect(controller.apply(req as never, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMyApplications', () => {
    it('should get applications for job seeker', async () => {
      const mockApplications = [{ id: 1 }, { id: 2 }];
      mockGetApplicationsForJobSeekerUseCase.execute.mockResolvedValue(
        mockApplications,
      );

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const result = await controller.getMyApplications(req as never);

      expect(
        mockGetApplicationsForJobSeekerUseCase.execute,
      ).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockApplications);
    });

    it('should throw ForbiddenException for non job seeker', async () => {
      const req = { user: { userId: 'user-1', role: 'COMPANY' } };

      await expect(controller.getMyApplications(req as never)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getApplicationsForCompany', () => {
    it('should get applications for company', async () => {
      const mockApplications = [{ id: 1 }, { id: 2 }];
      mockGetApplicationsForCompanyUseCase.execute.mockResolvedValue(
        mockApplications,
      );

      const req = { user: { userId: 'company-1', role: 'COMPANY' } };
      const result = await controller.getApplicationsForCompany(req as never);

      expect(mockGetApplicationsForCompanyUseCase.execute).toHaveBeenCalledWith(
        'company-1',
      );
      expect(result).toEqual(mockApplications);
    });

    it('should throw ForbiddenException for non company', async () => {
      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };

      await expect(
        controller.getApplicationsForCompany(req as never),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateApplication', () => {
    it('should update application status', async () => {
      const mockApplication = { id: 1, status: 'ACCEPTED' };
      mockUpdateApplicationStatusUseCase.execute.mockResolvedValue(
        mockApplication,
      );

      const req = { user: { userId: 'company-1', role: 'COMPANY' } };
      const dto = { status: 'ACCEPTED' as const };
      const result = await controller.updateApplication(req as never, 1, dto);

      expect(mockUpdateApplicationStatusUseCase.execute).toHaveBeenCalledWith(
        'company-1',
        1,
        'ACCEPTED',
      );
      expect(result).toEqual(mockApplication);
    });

    it('should throw ForbiddenException for non company', async () => {
      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const dto = { status: 'ACCEPTED' as const };

      await expect(
        controller.updateApplication(req as never, 1, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMatch', () => {
    it('should delete match successfully', async () => {
      mockDeleteMatchUseCase.execute.mockResolvedValue(undefined);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const result = await controller.deleteMatch(req as never, 1);

      expect(mockDeleteMatchUseCase.execute).toHaveBeenCalledWith('user-1', 1);
      expect(result).toEqual({ message: 'Match deleted successfully' });
    });

    it('should work for company users too', async () => {
      mockDeleteMatchUseCase.execute.mockResolvedValue(undefined);

      const req = { user: { userId: 'company-1', role: 'COMPANY' } };
      const result = await controller.deleteMatch(req as never, 1);

      expect(mockDeleteMatchUseCase.execute).toHaveBeenCalledWith('company-1', 1);
      expect(result).toEqual({ message: 'Match deleted successfully' });
    });
  });
});
