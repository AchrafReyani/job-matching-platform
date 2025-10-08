// src/vacancy/vacancy.module.ts
import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VacancyController],
  providers: [VacancyService, PrismaService],
})
export class VacancyModule {}
