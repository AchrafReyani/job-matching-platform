import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  DeleteAllJobSeekersUseCase,
  DeleteAllCompaniesUseCase,
} from './user-management.usecase';
import { ADMIN_REPOSITORY } from '../repository/admin.repository';

describe('User Management Use Cases', () => {
  const mockRepo = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    deleteAllJobSeekers: jest.fn(),
    deleteAllCompanies: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GetUsersUseCase', () => {
    let useCase: GetUsersUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GetUsersUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
    });

    it('should return paginated users', async () => {
      const mockResult = {
        data: [
          {
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            role: 'JOB_SEEKER',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      mockRepo.getUsers.mockResolvedValue(mockResult);

      const result = await useCase.execute({ page: 1, pageSize: 10 });

      expect(mockRepo.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by role', async () => {
      mockRepo.getUsers.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await useCase.execute({ role: 'JOB_SEEKER' });

      expect(mockRepo.getUsers).toHaveBeenCalledWith({ role: 'JOB_SEEKER' });
    });

    it('should filter by search term', async () => {
      mockRepo.getUsers.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await useCase.execute({ search: 'alice' });

      expect(mockRepo.getUsers).toHaveBeenCalledWith({ search: 'alice' });
    });
  });

  describe('GetUserByIdUseCase', () => {
    let useCase: GetUserByIdUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GetUserByIdUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    });

    it('should return user details', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'JOB_SEEKER',
        createdAt: new Date(),
        profile: { name: 'Test User' },
      };
      mockRepo.getUserById.mockResolvedValue(mockUser);

      const result = await useCase.execute('user-1');

      expect(mockRepo.getUserById).toHaveBeenCalledWith('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepo.getUserById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateUserUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    });

    it('should update user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'old@example.com',
        role: 'JOB_SEEKER',
      };
      mockRepo.getUserById.mockResolvedValue(mockUser);
      mockRepo.updateUser.mockResolvedValue(undefined);

      await useCase.execute('user-1', { email: 'new@example.com' });

      expect(mockRepo.updateUser).toHaveBeenCalledWith('user-1', {
        email: 'new@example.com',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepo.getUserById.mockResolvedValue(null);

      await expect(
        useCase.execute('nonexistent', { email: 'test@example.com' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.updateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to modify admin', async () => {
      mockRepo.getUserById.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });

      await expect(
        useCase.execute('admin-1', { email: 'test@example.com' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteUserUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    });

    it('should delete user successfully', async () => {
      const mockUser = { id: 'user-1', role: 'JOB_SEEKER' };
      mockRepo.getUserById.mockResolvedValue(mockUser);
      mockRepo.deleteUser.mockResolvedValue(undefined);

      await useCase.execute('user-1', 'admin-1');

      expect(mockRepo.deleteUser).toHaveBeenCalledWith('user-1', 'admin-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepo.getUserById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to delete admin', async () => {
      mockRepo.getUserById.mockResolvedValue({ id: 'admin-2', role: 'ADMIN' });

      await expect(useCase.execute('admin-2', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to delete yourself', async () => {
      mockRepo.getUserById.mockResolvedValue({
        id: 'admin-1',
        role: 'JOB_SEEKER',
      });

      await expect(useCase.execute('admin-1', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('DeleteAllJobSeekersUseCase', () => {
    let useCase: DeleteAllJobSeekersUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteAllJobSeekersUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<DeleteAllJobSeekersUseCase>(
        DeleteAllJobSeekersUseCase,
      );
    });

    it('should delete all job seekers and return count', async () => {
      mockRepo.deleteAllJobSeekers.mockResolvedValue(5);

      const result = await useCase.execute('admin-1');

      expect(mockRepo.deleteAllJobSeekers).toHaveBeenCalledWith('admin-1');
      expect(result).toBe(5);
    });
  });

  describe('DeleteAllCompaniesUseCase', () => {
    let useCase: DeleteAllCompaniesUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteAllCompaniesUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<DeleteAllCompaniesUseCase>(
        DeleteAllCompaniesUseCase,
      );
    });

    it('should delete all companies and return count', async () => {
      mockRepo.deleteAllCompanies.mockResolvedValue(3);

      const result = await useCase.execute('admin-1');

      expect(mockRepo.deleteAllCompanies).toHaveBeenCalledWith('admin-1');
      expect(result).toBe(3);
    });
  });
});
