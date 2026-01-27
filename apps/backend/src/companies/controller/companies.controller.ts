import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetCompanyByIdUseCase } from '../usecase/get-company-by-id.usecase';
import { GetAllCompaniesUseCase } from '../usecase/get-all-companies.usecase';
import { GetCompanyWithVacanciesUseCase } from '../usecase/get-company-with-vacancies.usecase';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase,
    private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase,
    private readonly getCompanyWithVacanciesUseCase: GetCompanyWithVacanciesUseCase,
  ) {}

  @Get(':id')
  async getCompany(@Param('id', ParseIntPipe) id: number) {
    return this.getCompanyByIdUseCase.execute(id);
  }

  @Get(':id/profile')
  async getCompanyProfile(@Param('id', ParseIntPipe) id: number) {
    return this.getCompanyWithVacanciesUseCase.execute(id);
  }

  @Get()
  async getAllCompanies() {
    return this.getAllCompaniesUseCase.execute();
  }
}
