import { Module } from '@nestjs/common';
import { ApplicationsController } from './controller/applications.controller';
import { PrismaApplicationRepository } from './infrastructure/prisma-application.repository';
import { PrismaService } from '../prisma/prisma.service';
import { APPLICATION_REPOSITORY } from './repository/application.repository';
import { CreateApplicationUseCase } from './usecase/create-application.usecase';
import { GetApplicationsForJobSeekerUseCase } from './usecase/get-applications-for-jobseeker.usecase';
import { GetApplicationsForCompanyUseCase } from './usecase/get-applications-for-company.usecase';
import { GetApplicationByIdUseCase } from './usecase/get-application-by-id.usecase';
import { UpdateApplicationStatusUseCase } from './usecase/update-application-status.usecase';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ApplicationsController],
  providers: [
    PrismaService,
    {
      provide: APPLICATION_REPOSITORY,
      useClass: PrismaApplicationRepository,
    },
    CreateApplicationUseCase,
    GetApplicationsForJobSeekerUseCase,
    GetApplicationsForCompanyUseCase,
    GetApplicationByIdUseCase,
    UpdateApplicationStatusUseCase,
  ],
})
export class ApplicationsModule {}
