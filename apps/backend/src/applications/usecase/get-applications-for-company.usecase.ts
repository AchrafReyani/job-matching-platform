import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import * as applicationRepository from "../repository/application.repository";

@Injectable()
export class GetApplicationsForCompanyUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<applicationRepository.ApplicationWithRelations[]> {
    const company =
      await this.applicationRepository.findCompanyByUserId(userId);
    if (!company) {
      throw new NotFoundException("Company profile not found");
    }

    return this.applicationRepository.findByCompanyId(company.id);
  }
}
