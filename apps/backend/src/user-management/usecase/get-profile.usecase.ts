import { Injectable, Inject } from '@nestjs/common';
import * as userManagementRepository from '../repository/user-management.repository';

export type ProfileResult = Omit<
  userManagementRepository.UserWithProfiles,
  'passwordHash'
>;

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(userManagementRepository.USER_MANAGEMENT_REPOSITORY)
    private readonly userManagementRepository: userManagementRepository.UserManagementRepository,
  ) {}

  async execute(userId: string): Promise<ProfileResult | null> {
    const user = await this.userManagementRepository.findUserById(userId);

    if (!user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
