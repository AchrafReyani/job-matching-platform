import { Injectable, Inject } from '@nestjs/common';
import * as vacancyRepository from '../repository/vacancy.repository';

@Injectable()
export class DeleteVacancyUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute(id: number, companyId: number) {
    return this.vacancyRepository.delete(id, companyId);
  }
}
