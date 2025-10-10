import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // GET /companies/:id
  @Get(':id')
  async getCompany(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyById(id);
  }

  // Optional: GET /companies
  @Get()
  async getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }
}
