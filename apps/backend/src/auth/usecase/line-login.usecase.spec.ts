import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as authRepository from '../repository/auth.repository';
import { LineLoginUseCase, placeholderEmail } from './line-login.usecase';

describe('LineLoginUseCase', () => {
  let useCase: LineLoginUseCase;
  const mockRepo = {
    findUserByEmail: jest.fn(),
    findUserByLineSub: jest.fn(),
    createLineUser: jest.fn(),
    setLineFriend: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoginUseCase,
        { provide: authRepository.AUTH_REPOSITORY, useValue: mockRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<LineLoginUseCase>(LineLoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const claims = {
    sub: 'renkei-sub-1',
    name: 'Achraf',
    email: 'renkei-sub-1@line.jobmatch.local',
  };

  it('logs in an existing LINE user and keeps the stored role', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue({
      id: 'user-1',
      role: 'COMPANY',
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    const result = await useCase.execute({
      claims,
      requestedRole: 'JOB_SEEKER',
    });

    expect(mockRepo.findUserByLineSub).toHaveBeenCalledWith('renkei-sub-1');
    expect(mockRepo.createLineUser).not.toHaveBeenCalled();
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'COMPANY',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('creates a job seeker on first login using the LINE display name and friend status', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createLineUser.mockResolvedValue({
      id: 'user-2',
      role: 'JOB_SEEKER',
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    const result = await useCase.execute({
      claims: { ...claims, lineFriend: true },
      requestedRole: 'JOB_SEEKER',
    });

    expect(mockRepo.createLineUser).toHaveBeenCalledWith({
      lineSub: 'renkei-sub-1',
      email: 'renkei-sub-1@line.jobmatch.local',
      role: 'JOB_SEEKER',
      displayName: 'Achraf',
      lineFriend: true,
    });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'user-2',
      role: 'JOB_SEEKER',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('creates a company when that role was requested', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createLineUser.mockResolvedValue({
      id: 'user-3',
      role: 'COMPANY',
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    await useCase.execute({ claims, requestedRole: 'COMPANY' });

    expect(mockRepo.createLineUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'COMPANY', displayName: 'Achraf' }),
    );
  });

  it('refreshes friend status on a returning login when the token disagrees', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue({
      id: 'user-1',
      role: 'JOB_SEEKER',
      lineFriend: false,
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    await useCase.execute({
      claims: { ...claims, lineFriend: true },
      requestedRole: 'JOB_SEEKER',
    });

    expect(mockRepo.setLineFriend).toHaveBeenCalledWith('user-1', true);
  });

  it('does not touch friend status when the token matches or omits it', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue({
      id: 'user-1',
      role: 'JOB_SEEKER',
      lineFriend: true,
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    await useCase.execute({
      claims: { ...claims, lineFriend: true },
      requestedRole: 'JOB_SEEKER',
    });
    await useCase.execute({ claims, requestedRole: 'JOB_SEEKER' }); // no lineFriend in claims

    expect(mockRepo.setLineFriend).not.toHaveBeenCalled();
  });

  it('falls back to a placeholder email and name when renkei provides none', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createLineUser.mockResolvedValue({
      id: 'user-4',
      role: 'JOB_SEEKER',
    });
    mockJwtService.sign.mockReturnValue('jwt-token');

    await useCase.execute({
      claims: { sub: 'ABC' },
      requestedRole: 'JOB_SEEKER',
    });

    expect(mockRepo.createLineUser).toHaveBeenCalledWith({
      lineSub: 'ABC',
      email: placeholderEmail('ABC'),
      role: 'JOB_SEEKER',
      displayName: 'LINE user',
      lineFriend: undefined,
    });
    expect(placeholderEmail('ABC')).toBe('line-abc@line.invalid');
  });

  it('refuses to create a LINE user when the email already belongs to a password account', async () => {
    mockRepo.findUserByLineSub.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue({
      id: 'user-5',
      role: 'JOB_SEEKER',
    });

    await expect(
      useCase.execute({ claims, requestedRole: 'JOB_SEEKER' }),
    ).rejects.toThrow(ConflictException);
    expect(mockRepo.createLineUser).not.toHaveBeenCalled();
  });
});
