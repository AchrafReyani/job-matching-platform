import { Injectable, Inject } from "@nestjs/common";
import * as companyRepository from "../repository/company.repository";

@Injectable()
export class GetAllCompaniesUseCase {
  constructor(
    @Inject(companyRepository.COMPANY_REPOSITORY)
    private readonly companyRepository: companyRepository.CompanyRepository,
  ) {}

  async execute(): Promise<companyRepository.CompanyPublicInfo[]> {
    return this.companyRepository.findAll();
  }
}
