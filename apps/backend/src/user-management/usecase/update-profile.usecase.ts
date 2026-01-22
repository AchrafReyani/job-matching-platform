import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JobSeeker, Company } from '@prisma/client';
import * as userManagementRepository from '../repository/user-management.repository';

export interface UpdateProfileResult {
  message: string;
  updated: JobSeeker | Company;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(userManagementRepository.USER_MANAGEMENT_REPOSITORY)
    private readonly userManagementRepository: userManagementRepository.UserManagementRepository,
  ) {}

  async execute(
    userId: string,
    role: string,
    data: userManagementRepository.UpdateJobSeekerProfileData | userManagementRepository.UpdateCompanyProfileData,
  ): Promise<UpdateProfileResult> {
    if (role === 'JOB_SEEKER') {
      const jobSeeker =
        await this.userManagementRepository.findJobSeekerByUserId(userId);

      if (!jobSeeker) {
        throw new NotFoundException('Job seeker profile not found');
      }

      const updated = await this.userManagementRepository.updateJobSeekerProfile(
        userId,
        data as userManagementRepository.UpdateJobSeekerProfileData,
      );

      return { message: 'Profile updated successfully', updated };
    }

    if (role === 'COMPANY') {
      const company =
        await this.userManagementRepository.findCompanyByUserId(userId);

      if (!company) {
        throw new NotFoundException('Company profile not found');
      }

      const updated = await this.userManagementRepository.updateCompanyProfile(
        userId,
        data as userManagementRepository.UpdateCompanyProfileData,
      );

      return { message: 'Company profile updated successfully', updated };
    }

    throw new BadRequestException('Invalid role for profile update');
  }
}
