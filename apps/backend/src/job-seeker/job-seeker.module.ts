import { Module } from '@nestjs/common';
import { JobSeekerController } from './job-seeker.controller';

@Module({
  controllers: [JobSeekerController]
})
export class JobSeekerModule {}
