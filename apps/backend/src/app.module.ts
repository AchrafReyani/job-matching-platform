import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UserManagementModule } from "./user-management/user-management.module";
import { UsersModule } from "./users/users.module";
import { VacancyModule } from "./vacancy/vacancy.module";
import { CompaniesModule } from "./companies/companies.module";
import { ApplicationsModule } from "./applications/applications.module";
import { MessagesModule } from "./messages/messages.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AdminModule } from "./admin/admin.module";
import { NewsModule } from "./news/news.module";

import { AppController } from "./app.controller";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UserManagementModule,
    UsersModule,
    VacancyModule,
    CompaniesModule,
    ApplicationsModule,
    MessagesModule,
    ProfilesModule,
    NotificationsModule,
    DashboardModule,
    AdminModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
