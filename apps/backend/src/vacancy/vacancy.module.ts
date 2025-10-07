import { Module } from '@nestjs/common';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';

@Module({
  controllers: [VacancyController],
  providers: [VacancyService]
})
export class VacancyModule {}
