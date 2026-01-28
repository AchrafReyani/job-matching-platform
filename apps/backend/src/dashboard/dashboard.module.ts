import { Module } from "@nestjs/common";
import { DashboardController } from "./controller/dashboard.controller";
import { PrismaDashboardRepository } from "./infrastructure/prisma-dashboard.repository";
import { PrismaService } from "../prisma/prisma.service";
import { DASHBOARD_REPOSITORY } from "./repository/dashboard.repository";
import { GetJobSeekerStatsUseCase } from "./usecase/get-job-seeker-stats.usecase";
import { GetCompanyStatsUseCase } from "./usecase/get-company-stats.usecase";

@Module({
  controllers: [DashboardController],
  providers: [
    PrismaService,
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: PrismaDashboardRepository,
    },
    GetJobSeekerStatsUseCase,
    GetCompanyStatsUseCase,
  ],
})
export class DashboardModule {}
