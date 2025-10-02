import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobSeekerModule } from './job-seeker/job-seeker.module';

@Module({
  imports: [JobsModule, AuthModule, UsersModule, JobSeekerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
