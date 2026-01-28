import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import * as companyRepository from "../repository/company.repository";

@Injectable()
export class GetCompanyByIdUseCase {
  constructor(
    @Inject(companyRepository.COMPANY_REPOSITORY)
    private readonly companyRepository: companyRepository.CompanyRepository,
  ) {}

  async execute(id: number): Promise<companyRepository.CompanyPublicInfo> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return company;
  }
}
