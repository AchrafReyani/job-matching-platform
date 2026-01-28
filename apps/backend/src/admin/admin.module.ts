import { Module } from "@nestjs/common";
import { AdminController } from "./controller/admin.controller";
import { PrismaAdminRepository } from "./infrastructure/prisma-admin.repository";
import { PrismaService } from "../prisma/prisma.service";
import { ADMIN_REPOSITORY } from "./repository/admin.repository";
import { GetAdminStatsUseCase } from "./usecase/get-admin-stats.usecase";
import {
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  DeleteAllJobSeekersUseCase,
  DeleteAllCompaniesUseCase,
} from "./usecase/user-management.usecase";
import {
  GetVacanciesUseCase,
  GetVacancyByIdUseCase,
  UpdateVacancyUseCase,
  DeleteVacancyUseCase,
  DeleteAllVacanciesUseCase,
} from "./usecase/vacancy-management.usecase";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    PrismaService,
    {
      provide: ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository,
    },
    GetAdminStatsUseCase,
    GetUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    DeleteAllJobSeekersUseCase,
    DeleteAllCompaniesUseCase,
    GetVacanciesUseCase,
    GetVacancyByIdUseCase,
    UpdateVacancyUseCase,
    DeleteVacancyUseCase,
    DeleteAllVacanciesUseCase,
  ],
})
export class AdminModule {}
