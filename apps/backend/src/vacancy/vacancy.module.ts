import { Module } from '@nestjs/common';
import { VacancyController } from './vacancy.controller';

@Module({
  controllers: [VacancyController]
})
export class VacancyModule {}
