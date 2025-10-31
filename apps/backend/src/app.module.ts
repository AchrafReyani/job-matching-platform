import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobSeekerModule } from './job-seeker/job-seeker.module';
import { CompanyModule } from './company/company.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { CompaniesModule } from './companies/companies.module';
import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [ AuthModule, UsersModule, JobSeekerModule, CompanyModule, VacancyModule, CompaniesModule, ApplicationsModule, MessagesModule, ProfilesModule, AccountModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
