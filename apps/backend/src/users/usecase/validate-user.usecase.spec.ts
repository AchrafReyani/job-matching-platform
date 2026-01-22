import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserUseCase } from './validate-user.usecase';
import * as userRepository from '../repository/user.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('ValidateUserUseCase', () => {
  let useCase: ValidateUserUseCase;
  const mockRepo = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserUseCase,
        {
          provide: userRepository.USER_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user if credentials are valid', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    };
    mockRepo.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('test@example.com', 'password123');

    expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );
    expect(result).toEqual(user);
  });

  it('should return null if user not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('nonexistent@example.com', 'password');

    expect(result).toBeNull();
  });

  it('should return null if password is invalid', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    };
    mockRepo.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute('test@example.com', 'wrong-password');

    expect(result).toBeNull();
  });
});
