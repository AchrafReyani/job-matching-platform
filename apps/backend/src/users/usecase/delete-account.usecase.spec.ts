import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DeleteAccountUseCase } from './delete-account.usecase';
import type { UserRepository } from '../repository/user.repository';

jest.mock('bcryptjs');

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockJobSeeker = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    role: 'JOB_SEEKER' as const,
    createdAt: new Date(),
    notificationPreferences: {},
  };

  const mockCompany = {
    id: 'company-123',
    email: 'company@example.com',
    passwordHash: 'hashedPassword',
    role: 'COMPANY' as const,
    createdAt: new Date(),
    notificationPreferences: {},
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@example.com',
    passwordHash: 'hashedPassword',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    notificationPreferences: {},
  };

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
      getNotificationPreferences: jest.fn(),
      updateNotificationPreferences: jest.fn(),
      deleteUser: jest.fn(),
    };

    useCase = new DeleteAccountUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete job seeker account successfully', async () => {
    mockUserRepository.findById.mockResolvedValue(mockJobSeeker);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockUserRepository.deleteUser.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        userId: 'user-123',
        password: 'correctPassword',
        confirmation: 'DELETE',
      }),
    ).resolves.toBeUndefined();

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('user-123', 'user-123');
  });

  it('should delete company account successfully', async () => {
    mockUserRepository.findById.mockResolvedValue(mockCompany);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockUserRepository.deleteUser.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        userId: 'company-123',
        password: 'correctPassword',
        confirmation: 'DELETE',
      }),
    ).resolves.toBeUndefined();

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('company-123', 'company-123');
  });

  it('should throw BadRequestException if confirmation is not DELETE', async () => {
    await expect(
      useCase.execute({
        userId: 'user-123',
        password: 'password',
        confirmation: 'delete',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockUserRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'nonexistent',
        password: 'password',
        confirmation: 'DELETE',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if admin tries to delete own account', async () => {
    mockUserRepository.findById.mockResolvedValue(mockAdmin);

    await expect(
      useCase.execute({
        userId: 'admin-123',
        password: 'password',
        confirmation: 'DELETE',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    mockUserRepository.findById.mockResolvedValue(mockJobSeeker);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId: 'user-123',
        password: 'wrongPassword',
        confirmation: 'DELETE',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
