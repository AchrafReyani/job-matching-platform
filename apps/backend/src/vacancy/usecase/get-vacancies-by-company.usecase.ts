import { Injectable, Inject } from '@nestjs/common';
import * as vacancyRepository from '../repository/vacancy.repository';

@Injectable()
export class GetVacanciesByCompanyUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute(companyId: number) {
    return this.vacancyRepository.findByCompany(companyId);
  }
}
