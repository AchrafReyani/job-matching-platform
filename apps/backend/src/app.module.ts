import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [JobsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
