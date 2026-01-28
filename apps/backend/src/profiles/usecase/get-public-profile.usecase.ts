import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import * as profileRepository from "../repository/profile.repository";

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    @Inject(profileRepository.PROFILE_REPOSITORY)
    private readonly profileRepository: profileRepository.ProfileRepository,
  ) {}

  async execute(userId: string): Promise<profileRepository.PublicProfile> {
    const user = await this.profileRepository.findUserWithProfiles(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "JOB_SEEKER") {
      return {
        userId: user.id,
        role: user.role,
        profile: {
          fullName: user.jobSeeker?.fullName,
          portfolioUrl: user.jobSeeker?.portfolioUrl,
          experienceSummary: user.jobSeeker?.experienceSummary,
        },
      };
    }

    if (user.role === "COMPANY") {
      return {
        userId: user.id,
        role: user.role,
        profile: {
          companyName: user.company?.companyName,
          websiteUrl: user.company?.websiteUrl,
          description: user.company?.description,
        },
      };
    }

    throw new NotFoundException("Profile not found for this user");
  }
}
