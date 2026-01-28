import { Injectable, Inject, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as userManagementRepository from "../repository/user-management.repository";
import { RegisterCompanyDto } from "../dto/register-company.dto";

export interface RegisterResult {
  message: string;
}

@Injectable()
export class RegisterCompanyUseCase {
  constructor(
    @Inject(userManagementRepository.USER_MANAGEMENT_REPOSITORY)
    private readonly userManagementRepository: userManagementRepository.UserManagementRepository,
  ) {}

  async execute(dto: RegisterCompanyDto): Promise<RegisterResult> {
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
      "COMPANY",
    );

    await this.userManagementRepository.createCompanyProfile(user.id, {
      companyName: dto.companyName,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    return { message: "Company registered successfully" };
  }
}
