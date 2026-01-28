import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import * as companyRepository from "../repository/company.repository";

@Injectable()
export class GetCompanyWithVacanciesUseCase {
  constructor(
    @Inject(companyRepository.COMPANY_REPOSITORY)
    private readonly companyRepository: companyRepository.CompanyRepository,
  ) {}

  async execute(id: number): Promise<companyRepository.CompanyWithVacancies> {
    const company = await this.companyRepository.findByIdWithVacancies(id);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return company;
  }
}
