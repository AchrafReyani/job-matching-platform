import { Injectable, Inject, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as userManagementRepository from "../repository/user-management.repository";
import { RegisterJobSeekerDto } from "../dto/register-jobseeker.dto";

export interface RegisterResult {
  message: string;
}

@Injectable()
export class RegisterJobSeekerUseCase {
  constructor(
    @Inject(userManagementRepository.USER_MANAGEMENT_REPOSITORY)
    private readonly userManagementRepository: userManagementRepository.UserManagementRepository,
  ) {}

  async execute(dto: RegisterJobSeekerDto): Promise<RegisterResult> {
    const existingUser = await this.userManagementRepository.findUserByEmail(
      dto.email,
    );

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userManagementRepository.createUser(
      dto.email,
      passwordHash,
      "JOB_SEEKER",
    );

    await this.userManagementRepository.createJobSeekerProfile(user.id, {
      fullName: dto.fullName,
      portfolioUrl: dto.portfolioUrl,
      experienceSummary: dto.experienceSummary,
    });

    return { message: "Job seeker registered successfully" };
  }
}
