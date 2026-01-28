import { Module } from "@nestjs/common";
import { CompaniesController } from "./controller/companies.controller";
import { PrismaCompanyRepository } from "./infrastructure/prisma-company.repository";
import { PrismaService } from "../prisma/prisma.service";
import { COMPANY_REPOSITORY } from "./repository/company.repository";
import { GetCompanyByIdUseCase } from "./usecase/get-company-by-id.usecase";
import { GetAllCompaniesUseCase } from "./usecase/get-all-companies.usecase";
import { GetCompanyWithVacanciesUseCase } from "./usecase/get-company-with-vacancies.usecase";

@Module({
  controllers: [CompaniesController],
  providers: [
    PrismaService,
    {
      provide: COMPANY_REPOSITORY,
      useClass: PrismaCompanyRepository,
    },
    GetCompanyByIdUseCase,
    GetAllCompaniesUseCase,
    GetCompanyWithVacanciesUseCase,
  ],
})
export class CompaniesModule {}
