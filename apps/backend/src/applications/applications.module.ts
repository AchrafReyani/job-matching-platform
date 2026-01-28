import { Module } from "@nestjs/common";
import { ApplicationsController } from "./controller/applications.controller";
import { PrismaApplicationRepository } from "./infrastructure/prisma-application.repository";
import { PrismaService } from "../prisma/prisma.service";
import { APPLICATION_REPOSITORY } from "./repository/application.repository";
import { CreateApplicationUseCase } from "./usecase/create-application.usecase";
import { GetApplicationsForJobSeekerUseCase } from "./usecase/get-applications-for-jobseeker.usecase";
import { GetApplicationsForCompanyUseCase } from "./usecase/get-applications-for-company.usecase";
import { GetApplicationByIdUseCase } from "./usecase/get-application-by-id.usecase";
import { UpdateApplicationStatusUseCase } from "./usecase/update-application-status.usecase";
import { DeleteMatchUseCase } from "./usecase/delete-match.usecase";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaUserRepository } from "../users/infrastructure/prisma-user.repository";
import { USER_REPOSITORY } from "../users/repository/user.repository";

@Module({
  imports: [NotificationsModule],
  controllers: [ApplicationsController],
  providers: [
    PrismaService,
    {
      provide: APPLICATION_REPOSITORY,
      useClass: PrismaApplicationRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateApplicationUseCase,
    GetApplicationsForJobSeekerUseCase,
    GetApplicationsForCompanyUseCase,
    GetApplicationByIdUseCase,
    UpdateApplicationStatusUseCase,
    DeleteMatchUseCase,
  ],
})
export class ApplicationsModule {}
