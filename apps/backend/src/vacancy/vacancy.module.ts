import { Module } from "@nestjs/common";
import { VacancyController } from "./controller/vacancy.controller";
import { PrismaVacancyRepository } from "./infrastructure/prisma-vacancy.repository";
import { PrismaService } from "../prisma/prisma.service";

import { CreateVacancyUseCase } from "./usecase/create-vacancy.usecase";
import { UpdateVacancyUseCase } from "./usecase/update-vacancy.usecase";
import { DeleteVacancyUseCase } from "./usecase/delete-vacancy.usecase";
import { GetVacanciesUseCase } from "./usecase/get-vacancies.usecase";
import { GetVacancyByIdUseCase } from "./usecase/get-vacancy-by-id.usecase";
import { GetVacanciesByCompanyUseCase } from "./usecase/get-vacancies-by-company.usecase";

import { VACANCY_REPOSITORY } from "./repository/vacancy.repository";

@Module({
  controllers: [VacancyController],
  providers: [
    PrismaService,
    {
      provide: VACANCY_REPOSITORY,
      useClass: PrismaVacancyRepository,
    },
    CreateVacancyUseCase,
    UpdateVacancyUseCase,
    DeleteVacancyUseCase,
    GetVacanciesUseCase,
    GetVacancyByIdUseCase,
    GetVacanciesByCompanyUseCase,
  ],
})
export class VacancyModule {}
