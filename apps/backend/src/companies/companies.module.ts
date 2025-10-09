import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Module({
  providers: [CompaniesService]
})
export class CompaniesModule {}
