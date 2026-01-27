import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordUseCase } from './change-password.usecase';
import type { UserRepository } from '../repository/user.repository';

jest.mock('bcryptjs');

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    role: 'JOB_SEEKER' as const,
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

    useCase = new ChangePasswordUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change password successfully', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock)
      .mockResolvedValueOnce(true) // current password check
      .mockResolvedValueOnce(false); // new password different check
    (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
    mockUserRepository.updatePassword.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      }),
    ).resolves.toBeUndefined();

    expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
      'user-123',
      'newHashedPassword',
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'nonexistent',
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if current password is incorrect', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if new password is same as current', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock)
      .mockResolvedValueOnce(true) // current password check
      .mockResolvedValueOnce(true); // new password same check

    await expect(
      useCase.execute({
        userId: 'user-123',
        currentPassword: 'samePassword',
        newPassword: 'samePassword',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
