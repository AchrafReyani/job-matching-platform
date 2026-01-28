import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { GetAdminStatsUseCase } from '../usecase/get-admin-stats.usecase';
import {
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  DeleteAllJobSeekersUseCase,
  DeleteAllCompaniesUseCase,
} from '../usecase/user-management.usecase';
import {
  GetVacanciesUseCase,
  GetVacancyByIdUseCase,
  UpdateVacancyUseCase,
  DeleteVacancyUseCase,
  DeleteAllVacanciesUseCase,
} from '../usecase/vacancy-management.usecase';

describe('AdminController', () => {
  let controller: AdminController;

  const mockGetAdminStatsUseCase = { execute: jest.fn() };
  const mockGetUsersUseCase = { execute: jest.fn() };
  const mockGetUserByIdUseCase = { execute: jest.fn() };
  const mockUpdateUserUseCase = { execute: jest.fn() };
  const mockDeleteUserUseCase = { execute: jest.fn() };
  const mockDeleteAllJobSeekersUseCase = { execute: jest.fn() };
  const mockDeleteAllCompaniesUseCase = { execute: jest.fn() };
  const mockGetVacanciesUseCase = { execute: jest.fn() };
  const mockGetVacancyByIdUseCase = { execute: jest.fn() };
  const mockUpdateVacancyUseCase = { execute: jest.fn() };
  const mockDeleteVacancyUseCase = { execute: jest.fn() };
  const mockDeleteAllVacanciesUseCase = { execute: jest.fn() };

  const mockRequest = {
    user: { userId: 'admin-1', role: 'ADMIN' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: GetAdminStatsUseCase, useValue: mockGetAdminStatsUseCase },
        { provide: GetUsersUseCase, useValue: mockGetUsersUseCase },
        { provide: GetUserByIdUseCase, useValue: mockGetUserByIdUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: DeleteUserUseCase, useValue: mockDeleteUserUseCase },
        {
          provide: DeleteAllJobSeekersUseCase,
          useValue: mockDeleteAllJobSeekersUseCase,
        },
        {
          provide: DeleteAllCompaniesUseCase,
          useValue: mockDeleteAllCompaniesUseCase,
        },
        { provide: GetVacanciesUseCase, useValue: mockGetVacanciesUseCase },
        { provide: GetVacancyByIdUseCase, useValue: mockGetVacancyByIdUseCase },
        { provide: UpdateVacancyUseCase, useValue: mockUpdateVacancyUseCase },
        { provide: DeleteVacancyUseCase, useValue: mockDeleteVacancyUseCase },
        {
          provide: DeleteAllVacanciesUseCase,
          useValue: mockDeleteAllVacanciesUseCase,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return admin stats', async () => {
      const mockStats = {
        totalJobSeekers: 100,
        totalCompanies: 50,
        totalVacancies: 200,
      };
      mockGetAdminStatsUseCase.execute.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(mockGetAdminStatsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('User Management Endpoints', () => {
    describe('getUsers', () => {
      it('should return users with default pagination', async () => {
        const mockResult = { data: [], total: 0, page: 1, pageSize: 10 };
        mockGetUsersUseCase.execute.mockResolvedValue(mockResult);

        const result = await controller.getUsers();

        expect(mockGetUsersUseCase.execute).toHaveBeenCalledWith({
          role: undefined,
          search: undefined,
          sortBy: undefined,
          sortOrder: undefined,
          page: undefined,
          pageSize: undefined,
        });
        expect(result).toEqual(mockResult);
      });

      it('should pass filter parameters', async () => {
        mockGetUsersUseCase.execute.mockResolvedValue({ data: [] });

        await controller.getUsers(
          'JOB_SEEKER',
          'alice',
          'email',
          'asc',
          '2',
          '20',
        );

        expect(mockGetUsersUseCase.execute).toHaveBeenCalledWith({
          role: 'JOB_SEEKER',
          search: 'alice',
          sortBy: 'email',
          sortOrder: 'asc',
          page: 2,
          pageSize: 20,
        });
      });
    });

    describe('getUserById', () => {
      it('should return user details', async () => {
        const mockUser = { id: 'user-1', email: 'test@example.com' };
        mockGetUserByIdUseCase.execute.mockResolvedValue(mockUser);

        const result = await controller.getUserById('user-1');

        expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith('user-1');
        expect(result).toEqual(mockUser);
      });
    });

    describe('updateUser', () => {
      it('should update user and return success message', async () => {
        mockUpdateUserUseCase.execute.mockResolvedValue(undefined);

        const result = await controller.updateUser('user-1', {
          email: 'new@example.com',
        });

        expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith('user-1', {
          email: 'new@example.com',
        });
        expect(result.message).toBe('User updated successfully');
      });
    });

    describe('deleteUser', () => {
      it('should delete user and return success message', async () => {
        mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

        const result = await controller.deleteUser(
          'user-1',
          mockRequest as never,
        );

        expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(
          'user-1',
          'admin-1',
        );
        expect(result.message).toBe('User deleted successfully');
      });
    });

    describe('deleteAllJobSeekers', () => {
      it('should delete all job seekers and return count', async () => {
        mockDeleteAllJobSeekersUseCase.execute.mockResolvedValue(5);

        const result = await controller.deleteAllJobSeekers(
          mockRequest as never,
        );

        expect(mockDeleteAllJobSeekersUseCase.execute).toHaveBeenCalledWith(
          'admin-1',
        );
        expect(result.message).toBe('5 job seekers deleted successfully');
        expect(result.count).toBe(5);
      });
    });

    describe('deleteAllCompanies', () => {
      it('should delete all companies and return count', async () => {
        mockDeleteAllCompaniesUseCase.execute.mockResolvedValue(3);

        const result = await controller.deleteAllCompanies(
          mockRequest as never,
        );

        expect(mockDeleteAllCompaniesUseCase.execute).toHaveBeenCalledWith(
          'admin-1',
        );
        expect(result.message).toBe('3 companies deleted successfully');
        expect(result.count).toBe(3);
      });
    });
  });

  describe('Vacancy Management Endpoints', () => {
    describe('getVacancies', () => {
      it('should return vacancies with default pagination', async () => {
        const mockResult = { data: [], total: 0, page: 1, pageSize: 10 };
        mockGetVacanciesUseCase.execute.mockResolvedValue(mockResult);

        const result = await controller.getVacancies();

        expect(mockGetVacanciesUseCase.execute).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
      });

      it('should pass filter parameters', async () => {
        mockGetVacanciesUseCase.execute.mockResolvedValue({ data: [] });

        await controller.getVacancies(
          '1',
          'engineer',
          'title',
          'asc',
          '2',
          '20',
        );

        expect(mockGetVacanciesUseCase.execute).toHaveBeenCalledWith({
          companyId: 1,
          search: 'engineer',
          sortBy: 'title',
          sortOrder: 'asc',
          page: 2,
          pageSize: 20,
        });
      });
    });

    describe('getVacancyById', () => {
      it('should return vacancy details', async () => {
        const mockVacancy = { id: 1, title: 'Software Engineer' };
        mockGetVacancyByIdUseCase.execute.mockResolvedValue(mockVacancy);

        const result = await controller.getVacancyById(1);

        expect(mockGetVacancyByIdUseCase.execute).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockVacancy);
      });
    });

    describe('updateVacancy', () => {
      it('should update vacancy and return success message', async () => {
        mockUpdateVacancyUseCase.execute.mockResolvedValue(undefined);

        const result = await controller.updateVacancy(1, {
          title: 'New Title',
        });

        expect(mockUpdateVacancyUseCase.execute).toHaveBeenCalledWith(1, {
          title: 'New Title',
        });
        expect(result.message).toBe('Vacancy updated successfully');
      });
    });

    describe('deleteVacancy', () => {
      it('should delete vacancy and return success message', async () => {
        mockDeleteVacancyUseCase.execute.mockResolvedValue(undefined);

        const result = await controller.deleteVacancy(1, mockRequest as never);

        expect(mockDeleteVacancyUseCase.execute).toHaveBeenCalledWith(
          1,
          'admin-1',
        );
        expect(result.message).toBe('Vacancy deleted successfully');
      });
    });

    describe('deleteAllVacancies', () => {
      it('should delete all vacancies and return count', async () => {
        mockDeleteAllVacanciesUseCase.execute.mockResolvedValue(10);

        const result = await controller.deleteAllVacancies(
          mockRequest as never,
        );

        expect(mockDeleteAllVacanciesUseCase.execute).toHaveBeenCalledWith(
          'admin-1',
        );
        expect(result.message).toBe('10 vacancies deleted successfully');
        expect(result.count).toBe(10);
      });
    });
  });
});
