import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from './user-management.controller';
import { RegisterJobSeekerUseCase } from '../usecase/register-jobseeker.usecase';
import { RegisterCompanyUseCase } from '../usecase/register-company.usecase';
import { GetProfileUseCase } from '../usecase/get-profile.usecase';
import { UpdateProfileUseCase } from '../usecase/update-profile.usecase';

describe('UserManagementController', () => {
  let controller: UserManagementController;
  const mockRegisterJobSeekerUseCase = { execute: jest.fn() };
  const mockRegisterCompanyUseCase = { execute: jest.fn() };
  const mockGetProfileUseCase = { execute: jest.fn() };
  const mockUpdateProfileUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        { provide: RegisterJobSeekerUseCase, useValue: mockRegisterJobSeekerUseCase },
        { provide: RegisterCompanyUseCase, useValue: mockRegisterCompanyUseCase },
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
        { provide: UpdateProfileUseCase, useValue: mockUpdateProfileUseCase },
      ],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerJobSeeker', () => {
    it('should register a job seeker', async () => {
      const mockResult = { message: 'Job seeker registered successfully' };
      mockRegisterJobSeekerUseCase.execute.mockResolvedValue(mockResult);

      const dto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'John Doe',
      };
      const result = await controller.registerJobSeeker(dto);

      expect(mockRegisterJobSeekerUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('registerCompany', () => {
    it('should register a company', async () => {
      const mockResult = { message: 'Company registered successfully' };
      mockRegisterCompanyUseCase.execute.mockResolvedValue(mockResult);

      const dto = {
        email: 'company@example.com',
        password: 'password123',
        companyName: 'Acme Corp',
      };
      const result = await controller.registerCompany(dto);

      expect(mockRegisterCompanyUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'JOB_SEEKER',
      };
      mockGetProfileUseCase.execute.mockResolvedValue(mockProfile);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const result = await controller.getProfile(req as never);

      expect(mockGetProfileUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('editProfile', () => {
    it('should update profile', async () => {
      const mockResult = { message: 'Profile updated successfully' };
      mockUpdateProfileUseCase.execute.mockResolvedValue(mockResult);

      const req = { user: { userId: 'user-1', role: 'JOB_SEEKER' } };
      const dto = { fullName: 'Updated Name' };
      const result = await controller.editProfile(req as never, dto);

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'JOB_SEEKER',
        dto,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
