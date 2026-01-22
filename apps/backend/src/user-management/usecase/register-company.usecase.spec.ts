import { Test, TestingModule } from '@nestjs/testing';
import { RegisterCompanyUseCase } from './register-company.usecase';
import { ConflictException } from '@nestjs/common';
import * as userManagementRepository from '../repository/user-management.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('RegisterCompanyUseCase', () => {
  let useCase: RegisterCompanyUseCase;
  const mockRepo = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createCompanyProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterCompanyUseCase,
        {
          provide: userManagementRepository.USER_MANAGEMENT_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<RegisterCompanyUseCase>(RegisterCompanyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a company successfully', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockRepo.createUser.mockResolvedValue({ id: 'user-1', email: 'company@example.com' });
    mockRepo.createCompanyProfile.mockResolvedValue({ id: 1, companyName: 'Acme Corp' });

    const dto = {
      email: 'company@example.com',
      password: 'password123',
      companyName: 'Acme Corp',
      websiteUrl: 'https://acme.com',
    };
    const result = await useCase.execute(dto);

    expect(mockRepo.findUserByEmail).toHaveBeenCalledWith('company@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockRepo.createUser).toHaveBeenCalledWith(
      'company@example.com',
      'hashed-password',
      'COMPANY',
    );
    expect(mockRepo.createCompanyProfile).toHaveBeenCalledWith('user-1', {
      companyName: 'Acme Corp',
      websiteUrl: 'https://acme.com',
      description: undefined,
    });
    expect(result).toEqual({ message: 'Company registered successfully' });
  });

  it('should throw ConflictException if email already registered', async () => {
    mockRepo.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

    const dto = {
      email: 'existing@example.com',
      password: 'password123',
      companyName: 'Acme Corp',
    };
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRepo.createUser).not.toHaveBeenCalled();
  });
});
