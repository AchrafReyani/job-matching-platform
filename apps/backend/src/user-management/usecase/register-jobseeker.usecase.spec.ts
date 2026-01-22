import { Test, TestingModule } from '@nestjs/testing';
import { RegisterJobSeekerUseCase } from './register-jobseeker.usecase';
import { ConflictException } from '@nestjs/common';
import * as userManagementRepository from '../repository/user-management.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('RegisterJobSeekerUseCase', () => {
  let useCase: RegisterJobSeekerUseCase;
  const mockRepo = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createJobSeekerProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterJobSeekerUseCase,
        {
          provide: userManagementRepository.USER_MANAGEMENT_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<RegisterJobSeekerUseCase>(RegisterJobSeekerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a job seeker successfully', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockRepo.createUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
    mockRepo.createJobSeekerProfile.mockResolvedValue({ id: 1, fullName: 'John Doe' });

    const dto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      portfolioUrl: 'https://portfolio.com',
    };
    const result = await useCase.execute(dto);

    expect(mockRepo.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockRepo.createUser).toHaveBeenCalledWith(
      'test@example.com',
      'hashed-password',
      'JOB_SEEKER',
    );
    expect(mockRepo.createJobSeekerProfile).toHaveBeenCalledWith('user-1', {
      fullName: 'John Doe',
      portfolioUrl: 'https://portfolio.com',
      experienceSummary: undefined,
    });
    expect(result).toEqual({ message: 'Job seeker registered successfully' });
  });

  it('should throw ConflictException if email already registered', async () => {
    mockRepo.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

    const dto = {
      email: 'existing@example.com',
      password: 'password123',
      fullName: 'John Doe',
    };
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRepo.createUser).not.toHaveBeenCalled();
  });
});
