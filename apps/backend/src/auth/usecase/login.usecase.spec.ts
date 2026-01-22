import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.usecase';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as authRepository from '../repository/auth.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const mockRepo = {
    findUserByEmail: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: authRepository.AUTH_REPOSITORY,
          useValue: mockRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and return access token', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'JOB_SEEKER',
    };
    mockRepo.findUserByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue('jwt-token');

    const dto = { email: 'test@example.com', password: 'password123' };
    const result = await useCase.execute(dto);

    expect(mockRepo.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'JOB_SEEKER',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);

    const dto = { email: 'nonexistent@example.com', password: 'password123' };
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'JOB_SEEKER',
    };
    mockRepo.findUserByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const dto = { email: 'test@example.com', password: 'wrong-password' };
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });
});
