import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetCompanyByIdUseCase } from '../usecase/get-company-by-id.usecase';
import { GetAllCompaniesUseCase } from '../usecase/get-all-companies.usecase';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase,
    private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase,
  ) {}

  @Get(':id')
  async getCompany(@Param('id', ParseIntPipe) id: number) {
    return this.getCompanyByIdUseCase.execute(id);
  }

  @Get()
  async getAllCompanies() {
    return this.getAllCompaniesUseCase.execute();
  }
}
