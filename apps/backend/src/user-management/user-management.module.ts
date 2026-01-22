import { Module } from '@nestjs/common';
import { UserManagementController } from './controller/user-management.controller';
import { PrismaUserManagementRepository } from './infrastructure/prisma-user-management.repository';
import { PrismaService } from '../prisma/prisma.service';
import { USER_MANAGEMENT_REPOSITORY } from './repository/user-management.repository';
import { RegisterJobSeekerUseCase } from './usecase/register-jobseeker.usecase';
import { RegisterCompanyUseCase } from './usecase/register-company.usecase';
import { GetProfileUseCase } from './usecase/get-profile.usecase';
import { UpdateProfileUseCase } from './usecase/update-profile.usecase';

@Module({
  controllers: [UserManagementController],
  providers: [
    PrismaService,
    {
      provide: USER_MANAGEMENT_REPOSITORY,
      useClass: PrismaUserManagementRepository,
    },
    RegisterJobSeekerUseCase,
    RegisterCompanyUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
  ],
})
export class UserManagementModule {}
