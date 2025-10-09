import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  providers: [CompaniesService],
  controllers: [CompaniesController]
})
export class CompaniesModule {}
