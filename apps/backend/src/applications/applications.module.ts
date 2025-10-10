import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';

@Module({
  controllers: [ApplicationsController]
})
export class ApplicationsModule {}
