import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { GetPublicProfileUseCase } from '../usecase/get-public-profile.usecase';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  const mockGetPublicProfileUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: GetPublicProfileUseCase, useValue: mockGetPublicProfileUseCase },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        userId: 'user-1',
        role: 'JOB_SEEKER',
        profile: { fullName: 'John Doe' },
      };
      mockGetPublicProfileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getProfile('user-1');

      expect(mockGetPublicProfileUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockProfile);
    });
  });
});
