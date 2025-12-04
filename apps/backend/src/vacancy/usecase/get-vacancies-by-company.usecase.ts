import { Injectable } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';

@Injectable()
export class GetVacanciesByCompanyUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute(companyId: number) {
    return this.vacancyRepository.findByCompany(companyId);
  }
}
