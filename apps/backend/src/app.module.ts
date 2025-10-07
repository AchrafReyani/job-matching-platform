import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobSeekerModule } from './job-seeker/job-seeker.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [ AuthModule, UsersModule, JobSeekerModule, CompanyModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
